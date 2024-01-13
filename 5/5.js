import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as render from './render.js'
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB("5.db");
db.query("CREATE TABLE IF NOT EXISTS people (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT)");

const router = new Router();

router.get('/', list)
  .get('/person/new', add)
  .get('/person/:id', show)
  .post('/person', create);

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

function query(sql) {
  let list = []
  for (const [id, name, phone] of db.query(sql)) {
    list.push({id, name, phone})
  }
  return list
}

async function list(ctx) {
  let people = query("SELECT id, name, phone FROM people")
  ctx.response.body = await render.list(people);
}

async function add(ctx) {
  ctx.response.body = await render.newPerson();
}

async function show(ctx) {
  const id = ctx.params.id;
  let people = query(`SELECT id, name, phone FROM people WHERE id=${id}`)
  let person = people[0]
  if (!person) ctx.throw(404, 'invalid person id');
  ctx.response.body = await render.show(person);
}

async function create(ctx) {
  const body = ctx.request.body()
  if (body.type === "form") {
    const pairs = await body.value
    const person = {}
    for (const [key, value] of pairs) {
      person[key] = value
    }
    db.query("INSERT INTO people (name, phone) VALUES (?, ?)", [person.name, person.phone]);
    ctx.response.redirect('/');
  }
}

console.log('Server run at http://127.0.0.1:8000')
await app.listen({ port: 8000 });