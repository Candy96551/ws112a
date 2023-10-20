import { Application, send } from "https://deno.land/x/oak/mod.ts";

const app = new Application();


app.use(async (ctx) => {
  const pathname = ctx.request.url.pathname;
  ctx.response.body = `
    <html>
        <body>
        <p>請輸入/nqu,/nqu/csie,to/nqu,to/nqu/csie</p>      
        </body>
    </html>`
  if (pathname == `/nqu`) {
    ctx.response.body = `
    <html>
        <body>
            <a href="https://www.nqu.edu.tw/">金門大學首頁</a>
        </body>
    </html>`
  }
  else if (pathname == `/nqu/csie`) {
    ctx.response.body = `
    <html>
        <body>
            <a href="https://csie.nqu.edu.tw/">金門大學資訊工程學系</a>
        </body>
    </html>`
  }
  else if (pathname == `/to/nqu`) {
    ctx.response.redirect('https://www.nqu.edu.tw/')
  }
  else if (pathname == `/to/nqu/csie`) {
    ctx.response.redirect('https://csie.nqu.edu.tw/')
  }
});

console.log('start at : http://127.0.0.1:8000')
await app.listen({ port: 8000 });
