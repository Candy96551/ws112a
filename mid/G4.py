from flask import Flask
app = Flask(__name__)

from flask import Flask, request,abort
from linebot import LineBotApi, WebhookHandler
from linebot.exceptions import InvalidSignatureError
from linebot.models import  MessageEvent, TextMessage, ImageSendMessage,TextSendMessage
import matplotlib.pyplot as plt
import requests
from bs4 import BeautifulSoup
import sqlite3
import pandas as pd
import pyimgur
import random
import serpapi

jdata = {'serpapi_key': 'your serpapi_key',
         'CLIENT_ID': 'your imgurapi_key',
         'LineBotApi': 'your LineBot Channel access token',    
         'handler': 'your LineBot Channel secret'    
}


#指令說明
command_pic_search_message = """
圖片搜尋指令請使用:
.jpg或.png(小寫)，
例如:test.jpg或search.png
"""
command_yt_search_message = """
YT搜尋指令請使用:
.yt(小寫)，
例如:test.yt
"""
command_cal_message = """
計算機指令請使用:
1: .c ，功能為四則運算，包含取餘數與指數，
例如: 1+2.c 或 5%4.C 或 5**3.c
                
2: .c2，功能為十進位轉二進位，
例如:2.c2 或 7.C2
                
3: .c8，功能為十進位轉八進位，
例如:5.c8 或 19.C8
                
4: .c16，功能為十進位轉十六進位，
例如:14.c16 或 96.C16

注意:計算機指令僅支持輸入:
數字(0~9)與運算子(+ - * / %)
"""
command_exchange_rate_message = """
匯率指令請使用:
1: 美金現金買入賣出 或 !美金現金買入賣出

2: 美金即期買入賣出 或 !美金即期買入賣出
"""
command_weather_message = """
天氣指令請使用:
天氣 或 !天氣
"""

command_sum_message = "此機器人所有指令功能如下:\n" + command_pic_search_message + command_yt_search_message + command_cal_message + command_exchange_rate_message + command_weather_message


line_bot_api = LineBotApi(jdata['LineBotApi'])
handler = WebhookHandler(jdata['handler'])

#創建table
def create_table():
    conn = sqlite3.connect('exchange_rate.db')
    cur = conn.cursor()
    cur.execute('''CREATE TABLE IF NOT EXISTS exchange_rate
                   (date , day_buy, day_sell, spot_buy, spot_sell)''')
    conn.commit()
    conn.close()
#插入數據
def insert_data(date , day_buy, day_sell, spot_buy, spot_sell):
    conn = sqlite3.connect('exchange_rate.db')
    cur = conn.cursor()
    cur.execute("INSERT INTO exchange_rate VALUES (?, ?, ?, ?, ?)", (date , day_buy, day_sell, spot_buy, spot_sell))
    conn.commit()
    conn.close()
#查詢數據
def select_data():
    conn = sqlite3.connect('exchange_rate.db')
    cur = conn.cursor()
    cur.execute("SELECT * FROM exchange_rate")
    rows = cur.fetchall()
    conn.close()
    return rows
#刪除數據
def drop_table():
    conn = sqlite3.connect('exchange_rate.db')
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS exchange_rate")
    conn.commit()
    conn.close()
#儲存相片
def upload_to_imgur(image_path):
    im = pyimgur.Imgur(jdata['CLIENT_ID'])
    uploaded_image = im.upload_image(image_path, title="Uploaded with PyImgur")
    return uploaded_image.link
#自動搜圖
image_formats = ['.jpg', '.png', '.jpeg']
def find_picture(mtext,event):
    if mtext[-4:].lower() in ['.jpg', '.png', '.jpeg']:
            URL_list = []
            params = {
                "engine": "google",
                "tbm": "isch"
            }
            try:
                params['q'] = mtext
                params['api_key'] = jdata['serpapi_key']
                client = serpapi.GoogleSearch(params)
                data = client.get_dict()
                while('error' in data.keys()):
                    params['api_key'] = jdata['serpapi_key']
                    client = serpapi.GoogleSearch(params)
                    data = client.get_dict()
                    print(data.keys())
                imgs = data['images_results']
                x = 0
                for img in imgs:
                    if x < 3 and img['original'][-4:].lower() in ['.jpg', '.png', 'jpeg'] and img['original'][:5] == 'https':
                        URL_list.append(img['original'])
                        x += 1
            except:
                url = 'https://www.google.com.tw/search?q=' + mtext + '&tbm=isch'
                request = requests.get(url=url)
                html = request.content
                bsObj = BeautifulSoup(html, 'html.parser')
                content = bsObj.findAll('img', {'class': 't0fcAb'})
                for i in content:
                    URL_list.append(i['src'])
            url = random.choice(URL_list)
            message = ImageSendMessage(original_content_url=url,preview_image_url=url)
            line_bot_api.reply_message(event.reply_token, message)
            print("enter output")
#yt搜尋
def find_yt(mtext,event):
    if mtext[-3:].lower() in ".yt":
        URL_list = []
        params = {
            "engine": "google",
            "tbm": "vid",
            "api_key": jdata['serpapi_key'],  # Replace 'Your_KEY' with your actual SerpApi key
        }
        params['q'] = mtext[0:-3]
        client = serpapi.GoogleSearch(params)
        data = client.get_dict()
        imgs = data['video_results']
        x = 0
        for img in imgs:
            if x < 1 and 'youtube' in img['link']:
                URL_list.append(img['link'])
                x += 1
        if URL_list:
            reply = TextSendMessage(text=URL_list[0])
            line_bot_api.reply_message(event.reply_token, reply)
        else:
            reply = TextSendMessage(text="No YouTube video found.")
            line_bot_api.reply_message(event.reply_token, reply)
#圖像設定
plt.rcParams["font.sans-serif"] = "Microsoft JhengHei"
plt.rcParams["axes.unicode_minus"] = False
#美金匯率爬蟲
def US_rate():
    url = 'https://rate.bot.com.tw/xrt/quote/l6m/USD'
    exchange_rate = requests.get(url)
    sp = BeautifulSoup(exchange_rate.text,'lxml')
    date = sp.select('td a')
    coin = sp.find_all('td',class_='text-center tablet_hide')

    day_buy   = sp.find_all('td',class_='rate-content-cash text-right print_table-cell')
    day_sell  = sp.find_all('td',class_='rate-content-cash text-right print_table-cell')
    spot_buy  = sp.find_all('td',class_='rate-content-sight text-right print_table-cell')
    spot_sell = sp.find_all('td',class_='rate-content-sight text-right print_table-cell')
    all_range = min(len(date), len(coin), len(day_buy), len(day_sell), len(spot_buy), len(spot_sell))

    create_table()

    for i in range(all_range):    
        insert_data(date[i].text, day_buy[i*2].text, day_sell[i*2+1].text, spot_buy[i*2].text, spot_sell[i*2+1].text)

    #資料庫搜尋並建立表格
    data = select_data()
    new_df = pd.DataFrame(data)
    new_df.columns = [u'時間',u'現金買入',u'現金賣出',u'即期買入',u'即期賣出']
    new_df.to_excel("USD.xlsx")

    #畫圖-現金買入與賣出
    #宣告儲存陣列與資料存入陣列
    dates = []
    cash_day_buy = []
    cash_day_sell =[]
    spot_day_buy = []
    spot_day_sell =[]

    for i in range(all_range):
        dates.append(date[i].text)
        cash_day_buy.append(float(day_buy[i*2].text))
        cash_day_sell.append(float(day_sell[i*2+1].text))

    #反轉陣列並設定折線圖
    dates = list(reversed(dates))
    cash_day_buy = list(reversed(cash_day_buy))
    cash_day_sell = list(reversed(cash_day_sell))

    plt.plot(dates, cash_day_buy, marker='o', linestyle='-', markersize=2, color='red', label='現金買入')
    plt.plot(dates,cash_day_sell, marker='o', linestyle='-', markersize=2, color='blue', label='現金賣出')

    #設定標題、XY軸與間隔
    plt.title('現金買入與賣出')
    plt.xlabel('日期')
    plt.ylabel('匯率')
    x_labels =  [date[127],date[95],date[63],date[31],date[0]]
    plt.xticks([0,32,64,96,128],x_labels)

    plt.legend()
    plt.tight_layout()

    #儲存照片
    plt.savefig('cash.png')
    US_cash = upload_to_imgur('cash.png')
    plt.clf()

    #畫圖-即期買入與賣出
    #宣告儲存陣列與資料存入陣列
    dates_spot = [] 
    spot_day_buy = [] 
    spot_day_sell = [] 

    for i in range(all_range):
        dates_spot.append(date[i].text)
        spot_day_buy.append(float(spot_buy[i*2].text))
        spot_day_sell.append(float(spot_sell[i*2+1].text))

    #反轉陣列並設定折線圖
    dates_spot = list(reversed(dates_spot))
    spot_day_buy = list(reversed(spot_day_buy))
    spot_day_sell = list(reversed(spot_day_sell))

    plt.plot(dates_spot, spot_day_buy, marker='o', linestyle='-', markersize=2, color='red', label='即期買入')
    plt.plot(dates_spot, spot_day_sell, marker='o', linestyle='-', markersize=2, color='blue', label='即期賣出')

    #設定標題、XY軸與間隔
    plt.title('即期買入與賣出')
    plt.xlabel('日期')
    plt.ylabel('匯率')


    plt.xticks([0,32,64,96,128],x_labels)


    plt.tight_layout()
    plt.legend()

    #儲存照片
    plt.savefig('spot.png')
    US_spot = upload_to_imgur('spot.png')
    global US_spot_global,US_cash_global
    US_spot_global = US_spot
    US_cash_global = US_cash
    drop_table()
#天氣
def wheather(mtext,event):
    global wheather_img_global
    url = "https://www.cwa.gov.tw/V8/C/W/OBS_Temp.html"
    weather = requests.get(url)
    sp = BeautifulSoup(weather.text, 'lxml')
    wrapper = sp.select('div.wrapper')  
    image = wrapper[0].find('img')  
    image_links = "https://www.cwa.gov.tw" + image.get("src") 
    img = requests.get(image_links)

    filename = 'weather_image.jpg'
    with open(filename, 'wb') as f:
        f.write(img.content)
    wheather_img = upload_to_imgur(filename)
    wheather_img_global = wheather_img
    if mtext == '天氣' or mtext == '!天氣' or mtext == '！天氣':
            picurl = wheather_img_global
            line_bot_api.reply_message(event.reply_token, ImageSendMessage(original_content_url=picurl, preview_image_url=picurl))
#計算機
def calculator(mtext,event):
    if mtext.endswith('.c') or mtext.endswith('.C'):
        arithmetic(mtext,event)
        
    elif mtext.endswith('.c2') or mtext.endswith('.C2'):
        try:
            result = bin(int(mtext[:-3]))[2:] # 嘗試將 mtext 解釋為整數，再轉換為二進位字串
            line_bot_api.reply_message(event.reply_token, TextSendMessage(text=result))
        except ValueError:
            line_bot_api.reply_message(event.reply_token, "指令錯誤，請嘗試:.c2") # 若解釋為整數失敗，回傳錯誤訊息
        
    elif mtext.endswith('.c8') or mtext.endswith('.C8'):
        try:
            result = oct(int(mtext[:-3]))[2:] # 嘗試將 mtext 解釋為整數，再轉換為八進位字串
            line_bot_api.reply_message(event.reply_token, TextSendMessage(text=result))
        except ValueError:
            line_bot_api.reply_message(event.reply_token, "指令錯誤，請嘗試:.c8") # 若解釋為整數失敗，回傳錯誤訊息
            
    elif mtext.endswith('.c16') or mtext.endswith('.C16'):
        try:
            result = hex(int(mtext[:-4]))[2:] # 嘗試將 mtext 解釋為整數，再轉換為十六進位字串
            line_bot_api.reply_message(event.reply_token, TextSendMessage(text=result))
        except ValueError:
            line_bot_api.reply_message(event.reply_token, "指令錯誤，請嘗試:.c16") # 若解釋為整數失敗，回傳錯誤訊息
#計算機-算術        
def arithmetic(mtext,event):
    allowed_operations = set('+-*/%1234567890')
    user_input = mtext[:-2]
    
    if all(char in allowed_operations for char in user_input):# 檢查 mtext 輸入符合 allowed_operations
        try:
            result = str(eval(user_input))
            line_bot_api.reply_message(event.reply_token, TextSendMessage(text=result))
        except ValueError:
            line_bot_api.reply_message(event.reply_token, "指令錯誤，請嘗試:.c") # 若解釋為整數失敗，回傳錯誤訊息
    else:
        result = "Invalid input" # 若 mtext 輸入不符合 allowed_operations ，回傳錯誤訊息
        line_bot_api.reply_message(event.reply_token, TextSendMessage(text=result))
            
#建立line bot
@app.route('/callback', methods=['POST'])
def callback():
    signature = request.headers['X-Line-Signature']
    body = request.get_data(as_text=True)
    try:
        handler.handle(body, signature)
    except InvalidSignatureError:
        abort(400)  
    return 'OK'
US_rate()

guessrange = [0,100]

@handler.add(MessageEvent, message=TextMessage)
def handle_message(event):
    try:
        if isinstance(event.message, TextMessage):
            mtext = event.message.text

            find_picture(mtext, event)
            find_yt(mtext, event)
            wheather(mtext, event)
            calculator(mtext, event)

            if mtext == '美金現金買入賣出' or mtext == '！美金現金買入賣出' or mtext == '!美金現金買入賣出':
                picurl = US_cash_global
                line_bot_api.reply_message(event.reply_token, ImageSendMessage(original_content_url=picurl, preview_image_url=picurl))

            elif mtext == '美金即期買入賣出' or mtext == '！美金即期買入賣出' or mtext == '!美金即期買入賣出':
                picurl = US_spot_global
                line_bot_api.reply_message(event.reply_token, ImageSendMessage(original_content_url=picurl, preview_image_url=picurl))

            elif mtext == '!圖片搜尋' or mtext == '！圖片搜尋':
                line_bot_api.reply_message(event.reply_token, TextSendMessage(text=command_pic_search_message))
                
            elif mtext == '!YT搜尋' or mtext == '！YT搜尋' or mtext == '！Yt搜尋' or mtext == '！Yt搜尋' or mtext == '！yt搜尋' or mtext == '！yt搜尋' or mtext == '！yT搜尋' or mtext == '！yT搜尋':
                line_bot_api.reply_message(event.reply_token, TextSendMessage(text=command_yt_search_message))
                
            elif mtext == '!計算機' or mtext == '！計算機':
                line_bot_api.reply_message(event.reply_token, TextSendMessage(text=command_cal_message))
            
            elif mtext == '!指令集' or mtext == '！指令集' or mtext == '指令集':
                line_bot_api.reply_message(event.reply_token, TextSendMessage(text=command_sum_message))
            
            else:
                line_bot_api.reply_message(event.reply_token, TextSendMessage(text="指令不存在，可點擊linebot快速指令表單，也可輸入:指令集 或 !指令集"))
                
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == '__main__': 
    app.run()