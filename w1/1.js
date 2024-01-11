import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application();


app.use((ctx) => {
  console.log('ctx.request.url=', ctx.request.url)
  ctx.response.body =`
<html>
        <body>
        </body>
</html>
  `
  let pathname = ctx.request.url.pathname
  if (pathname=="/nqu") {
    ctx.response.body =`
    <html>
      <body>
        <a href="https://www.nqu.edu.tw/">金門大學<a>
      </body>
    </html>
    `
  } else  if (pathname=="/nqu/csie") {
    ctx.response.body =`
    <html>
      <body>
        <a href="https://csie.nqu.edu.tw/">金門大學資工系<a>
      </body>
    </html>
    `
  }

   else if (pathname=="/to/nqu"){
    ctx.response.redirect('https://www.nqu.edu.tw/')

  }

   else if (ctx.request.url.pathname=="/to/nqu/csie"){
    ctx.response.redirect('https://csie.nqu.edu.tw/')
  }

});

console.log('start at : http://127.0.0.1:8000')
await app.listen({ port: 8000 });