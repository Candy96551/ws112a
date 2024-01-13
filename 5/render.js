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
    
        input[type=text],
        textarea {
          border: 1px solid #eee;
          border-top-color: #ddd;
          border-left-color: #ddd;
          border-radius: 2px;
          padding: 15px;
          font-size: .8em;
        }
    
        input[type=text] {
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
    `
  }
  
  export function list(people) {
    let list = []
    for (let person of people) {
      list.push(`
      <li>
        <h2>${ person.name}</h2>
        <p><a href="/person/${person.id}">查看聯絡人資料</a></p>
      </li>
      `)
    }
    let content = `
    <h1>通訊錄</h1>
    <p>你有 <strong>${people.length}</strong> 個聯絡人!</p>
    <p><a href="/person/new">新增聯絡人</a></p>
    <ul id="people">
      ${list.join('\n')}
    </ul>
    `
    return layout('通訊錄', content)
  }
  
  export function newPerson() {
    return layout('新增聯絡人', `
    <h1>新聯絡人</h1>
    <p>填寫聯絡人資料</p>
    <form action="/person" method="post">
      <p><input type="text" placeholder="姓名" name="name"></p>
      <p><textarea placeholder="電話號碼" name="phone"></textarea></p>
      <p><input type="submit" value="新增"></p>
    </form>
    `)
  }
  
  export function show(person) {
    return layout(person.name, `
      <h1>${person.name}</h1>
      <pre>${person.phone}</pre>
    `)
  }
  