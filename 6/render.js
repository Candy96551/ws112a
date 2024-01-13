export function layout(title, content) {
    return `
      <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            padding: 80px;
            font: 16px Helvetica, Arial;
          }
  
          h1 {
            font-size: 2em;
          }
  
          h2 {
            font-size: 1.2em;
          }
  
          #posts {
            margin: 0;
            padding: 0;
          }
  
          #posts li {
            margin: 40px 0;
            padding: 0;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
            list-style: none;
          }
  
          #posts li:last-child {
            border-bottom: none;
          }
  
          textarea {
            width: 500px;
            height: 300px;
          }
  
          input[type=text], input[type=password], textarea {
            border: 1px solid #eee;
            border-top-color: #ddd;
            border-left-color: #ddd;
            border-radius: 2px;
            padding: 15px;
            font-size: .8em;
          }
  
          input[type=text], input[type=password] {
            width: 500px;
          }
        </style>
      </head>
      <body>
        <section id="content">
          ${content}
        </section>
      </body>
      </html>
    `;
  }
  
  export function loginUi() {
    return layout('登入', `
      <h1>登入</h1>
      <form action="/login" method="post">
        <p><input type="text" placeholder="使用者名稱" name="username"></p>
        <p><input type="password" placeholder="密碼" name="password"></p>
        <p><input type="submit" value="登入"></p>
        <p>新用戶？ <a href="/signup">創建一個帳戶</a></p>
      </form>
    `);
  }
  
  export function signupUi() {
    return layout('註冊', `
      <h1>註冊</h1>
      <form action="/signup" method="post">
        <p><input type="text" placeholder="使用者名稱" name="username"></p>
        <p><input type="password" placeholder="密碼" name="password"></p>
        <p><input type="text" placeholder="電子郵件" name="email"></p>
        <p><input type="submit" value="註冊"></p>
      </form>
    `);
  }
  
  export function success() {
    return layout('成功', `
      <h1>成功！</h1>
      您可以 <a href="/">查看資料</a> / <a href="/login">重新登入</a> ！
    `);
  }
  
  export function fail() {
    return layout('失敗', `
      <h1>失敗！</h1>
      您可以 <a href="/">查看資料</a> 或 <a href="JavaScript:window.history.back()">返回</a> ！
    `);
  }
  
  export function list(posts, user) {
    console.log('list: user=', user)
    let list = posts.map(post => `
      <li>
        <h2>${post.title} -- by ${post.username}</h2>
        <p><a href="/post/${post.id}">查看資料</a></p>
      </li>
    `);
  
    let content = `
      <h1>文章列表</h1>
      <p>${(user == null) ? '<a href="/login">登入</a>創建新資料' : `歡迎 ${user.username}，您可以 <a href="/post/new">創建新資料</a> 或 <a href="/logout">登出</a>！`}</p>
      <p>共有 <strong>${posts.length}</strong> 筆資料！</p>
      <ul id="posts">
        ${list.join('\n')}
      </ul>
    `;
    return layout('文章列表', content);
  }
  
  export function newPost() {
    return layout('New Post', `
      <h1>新增聯絡人</h1>
      <p>創建新聯絡人資料</p>
      <form action="/post" method="post">
        <p><input type="text" placeholder="姓名" name="title"></p>
        <p><textarea placeholder="電話" name="body"></textarea></p>
        <p><input type="submit" value="創建"></p>
      </form>
    `);
  }
  
  export function show(post) {
    return layout(post.title, `
      <h1>${post.title} -- by ${post.username}</h1>
      <p>${post.body}</p>
    `);
  }
  