import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB("peoples.db");
db.query("CREATE TABLE IF NOT EXISTS people (name TEXT, password TEXT)");

const router = new Router();

router
  .get("/", (ctx) => {
    ctx.response.redirect('http://127.0.0.1:8000/web/index.html')
  })
  .get("/people", async (ctx) => {
    const peopleList = [];
    for (const [name, password] of db.query("SELECT * FROM people")) {
      peopleList.push({ name, password });
    }
    ctx.response.body = peopleList;
  })
  .post("/people/add", async (ctx) => {
    const body = ctx.request.body();
    if (body.type === "form") {
      const pairs = await body.value;
      const params = {};
      for (const [key, value] of pairs) {
        params[key] = value;
      }
      const name = params['name'];
      const password = params['password'];

      const existingUser = db.query("SELECT * FROM people WHERE name = ?", [name]);

      if (existingUser.length > 0) {
        ctx.response.type = 'text/html';
        ctx.response.body = `<p>此帳號已經註冊過，註冊失敗</p><p><a href="http://127.0.0.1:8000/web/add.html">請重新註冊一次</a></p>`;
      } else {
        db.query("INSERT INTO people (name, password) VALUES (?, ?)", [name, password]);
        ctx.response.type = 'text/html';
        ctx.response.body = `<p>您已註冊成功</p><p><a href="http://127.0.0.1:8000/web/index.html">請登入</a></p>`;
      }
    }
  })
  .post("/people/find", async (ctx) => {
    const body = ctx.request.body();
    if (body.type === "form") {
      const pairs = await body.value;
      const params = {};
      for (const [key, value] of pairs) {
        params[key] = value;
      }
      const name = params['name'];
      const password = params['password'];

      const user = db.query("SELECT * FROM people WHERE name = ? AND password = ?", [name, password]);

      if (user.length > 0) {
        ctx.response.type = 'text/html';
        ctx.response.body = `<p>登陸成功</p><p><a href="http://127.0.0.1:8000/web/homepage.html">點擊進入遊戲</a></p>`;
      } else {
        ctx.response.type = 'text/html';
        ctx.response.body = `<p>密碼錯誤，登陸失敗</p><p><a href="http://127.0.0.1:8000/web/index.html">請重新登入</a></p>`;
      }
    }
  })
  .get("/people/find", (ctx) => {
    const params = ctx.request.url.searchParams;
    const name = params.get('name');
    const user = db.query("SELECT * FROM people WHERE name = ?", [name]);

    if (user.length > 0) {
      ctx.response.body = user[0];
    }
  })
  .get("/web/(.*)", async (ctx) => {
    const wpath = ctx.params[0];
    await send(ctx, wpath, {
      root: Deno.cwd() + "/web/",
      index: "index.html",
    });
  });

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

console.log('start at : http://127.0.0.1:8000');

await app.listen({ port: 8000 });
