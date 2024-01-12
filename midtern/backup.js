import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
 
const peoples = new Map();
peoples.set("john", {
  name: "john",
  password: "082-313345",
});
peoples.set("mary", {
  name: "mary",
  password: "082-313543",
});

const router = new Router();
router
  .get("/", (ctx) => {
    ctx.response.redirect('http://127.0.0.1:8000/web/index.html')
  })
  .get("/people", (ctx) => {
    ctx.response.body = Array.from(peoples.values());
  })
  .post("/people/add", async (ctx) => {
    const body = ctx.request.body()
    if (body.type === "form") {
      const pairs = await body.value
      console.log('pairs=', pairs)
      const params = {}
      for (const [key, value] of pairs) {
        params[key] = value
      }
      console.log('params=', params)
      let name = params['name']
      let password = params['password']
      console.log(`name=${name} password=${password}`)
      if (peoples.get(name)) {
        ctx.response.type = 'text/html'
        ctx.response.body = `<p>此帳號已經註冊過，註冊失敗</p><p><a href="http://127.0.0.1:8000/web/add.html">請重新註冊一次</a></p>`
      } 
      else {
        peoples.set(name, {name, password})
        ctx.response.type = 'text/html'
        ctx.response.body = `<p>您已註冊成功</p><p><a href="http://127.0.0.1:8000/web/index.html">請登入</a></p>`
      }
  
    }
  })
  .post("/people/find", async (ctx) => {
    const body = ctx.request.body()
    if (body.type === "form") {
      const pairs = await body.value
      console.log('pairs=', pairs)
      const params = {}
      for (const [key, value] of pairs) {
        params[key] = value
      }
      console.log('params=', params)
      let name = params['name']
      let password = params['password']
      console.log(`name=${name} password=${password}`)
      if (peoples.get(name) && password == peoples.get(name).password) {
        ctx.response.type = 'text/html'
        ctx.response.body = `<p>登陸成功</p><p><a href="http://127.0.0.1:8000/web/homepage.html">點擊進入遊戲</a></p>`
      } 
      else {
        ctx.response.type = 'text/html'
        ctx.response.body = `<p>密碼錯誤，登陸失敗</p><p><a href="http://127.0.0.1:8000/web/index.html">請重新登入</a></p>`
      }
  
    }
  })
  .get("/people/find", (ctx) => {
    let params = ctx.request.url.searchParams    
    let name = params.get('name')
    console.log('name=', name)
    if (peoples.has(name)) {
      ctx.response.body = peoples.get(name);
    }
  })
  .get("/web/(.*)", async (ctx) => {
    let wpath = ctx.params[0]
    console.log('wpath=', wpath)
    await send(ctx, wpath, {
      root: Deno.cwd()+"/web/",
      index: "index.html",
    })
  })

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

console.log('start at : http://127.0.0.1:8000')

await app.listen({ port: 8000 });