import { Application, Router } from "https://deno.land/x/oak/mod.ts";

const room = new Map();
room.set("e319", {
    教室: "e319",
    功能: "數位系統應用實驗室",
});
room.set("e320", {
     教室: "e320",
     功能: "多媒體實驗室"
});
room.set("e321", {
    教室: "e321",
    功能: "電腦網路實驗室",
});
room.set("e322", {
    教室: "e322",
    功能: "嵌入式實驗室",
});

const router = new Router();
router
    .get("/", (context) => {
        context.response.body = "Hello world!";
    })
    .get("/nqu", (context) => {
        context.response.body = `
    <html>
        <body>
            <a href="https://www.nqu.edu.tw/">金門大學首頁</a>
        </body>
    </html>`
    })
    .get("/nqu/csie", (context) => {
        context.response.body = `
    <html>
        <body>
            <a href="https://csie.nqu.edu.tw/">金門大學資訊工程學系</a>
        </body>
    </html>`
    })
    .get("/to/nqu", (context) => {
        context.response.redirect('https://www.nqu.edu.tw/')
    })
    .get("/to/nqu/csie", (context) => {
        context.response.redirect('https://csie.nqu.edu.tw/')
    })
    .get("/room/:id", (context) => {
        if (context.params && context.params.id && room.has(context.params.id)) {
            context.response.body = room.get(context.params.id);
        }
    });
    

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

console.log('start at : http://127.0.0.1:8000')
await app.listen({ port: 8000 });