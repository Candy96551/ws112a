import { Application, Router } from "https://deno.land/x/oak/mod.ts";

const room = new Map();
room.set("E319", {
  教室: "E319",
  名稱: "嵌入式實驗室"
});
room.set("E320", {
  教室: "E320",
  名稱: "多媒體教室"
});
const router = new Router();
router
  .get("/", (context) => {
    context.response.body = "Hello world!";
  })
  .get("/nqu", (context) => {
    context.response.body = (`
    <html>
      <body>
      <a href="https://www.nqu.edu.tw/">金門大學<a>
      </body>
    </html>
    `);
  })
  .get("/nqu/csie", (context) => {
    context.response.body = (`
    <html>
      <body>
      <a href="https://csie.nqu.edu.tw/">金門大學資工系<a>
      </body>
    </html>
    `);
  })
  .get("/to/nqu", (context) => {
    context.response.redirect('https://www.nqu.edu.tw/')
  })
  .get("/to/nqu/csie", (context) => {
    context.response.redirect('https://csie.nqu.edu.tw/')
  })
  .get("/room/:id", (context) => {
    console.log('id=', context.params.id)
    if (context.params && context.params.id && room.has(context.params.id)) {
        console.log('room=', room.get(context.params.id))
        context.response.body = room.get(context.params.id);
    }
  });
const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

console.log('start at : http://127.0.0.1:8000')
await app.listen({ port: 8000 });