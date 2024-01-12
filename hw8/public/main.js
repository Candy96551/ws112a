var R = {}

var socket = new WebSocket("ws://"+window.location.hostname+":8080")

socket.onopen = function (event) {
  console.log('socket:onopen()...')
}

function send(o) {
  if (socket.readyState==1) {
    socket.send(JSON.stringify(o))
  } else {
    setTimeout(function() {
      send(o)
    }, 1000)
  }
}

window.onhashchange = async function () {
  var tokens = window.location.hash.split('/')
  console.log('tokens=', tokens)
  switch (tokens[0]) {
    case '#show':
      send({type:'show', post:{id: parseInt(tokens[1])}})
      break
    case '#new':
      R.new()
      break
    default:
      send({type:'list'})
      break
  }
}

socket.onmessage = function(event){
  var msg = JSON.parse(event.data);
  console.log('onmessage: msg=', msg);
  switch (msg.type) {
    case 'show': 
      R.show(msg.post)
      break
    case 'list':
      R.list(msg.posts)
      break
  }
}

window.onload = function () {
  console.log('onload')
  window.location.href = "#list"
  window.onhashchange()
}

R.layout = function (title, content) {
  document.querySelector('title').innerText = title
  document.querySelector('#content').innerHTML = content
}

R.list = function (posts) {
  let list = []
  for (let post of posts) {
    list.push(`
    <li>
      <h2>${post.title}</h2>
      <p><a id="show${post.id}" href="#show/${post.id}">查詢聯絡人</a></p>
    </li>
    `)
  }
  let content = `
  <h1>我的通訊錄</h1>
  <p>共有 <strong>${posts.length}</strong> 個聯絡人</p>
  <p><a id="createPost" href="#new">新增聯絡人</a></p>
  <ul id="posts">
    ${list.join('\n')}
  </ul>
  `
  return R.layout('通訊錄', content)
}

R.new = function () {
  return R.layout('新增聯絡人', `
  <h1>新增聯絡人</h1>
  <form>
    <p><input id="title" type="text" placeholder="名字" name="title"></p>
    <p><textarea id="body" placeholder="電話" name="body"></textarea></p>
    <p><input id="savePost" type="button" onclick="R.savePost()" value="建立"></p>
  </form>
  `)
}

R.show = function (post) {
  return R.layout(post.title, `
    <h1>${post.title}</h1>
    <p>${post.body}</p>
  `)
}

R.savePost = function () {
  let title = document.querySelector('#title').value
  let body = document.querySelector('#body').value
  send({type:'create', post:{title: title, body: body}})
  window.location.hash = '#list'
}