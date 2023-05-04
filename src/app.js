const http = require("http");
const Io = require("./utils/Io");
const parser = require("./utils/parser");
const Todo = require("./models/todo");
const Todos = new Io("./db/todo.json");

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  // todo qo'shish
  if (req.url == "/todo" && req.method == "POST") {
    try {
      req.body = await parser(req);

      const { title, text } = req.body;

      const todos = await Todos.read();
      const id = (todos[todos.length - 1]?.id || 0) + 1;
      const date = new Date();

      const newTodo = new Todo(id, text, title, date);

      const data = todos.length ? [...todos, newTodo] : [newTodo];
      Todos.write(data);

      res.writeHead(201);
      res.end(JSON.stringify({ success: "Created todo" }));
    } catch {
      res.writeHead(404);
      res.end(JSON.stringify({ massage: "Error request" }));
    }

    // todolarni o'qish
  } else if (req.url == "/todo" && req.method == "GET") {
    try {
      const todoss = await Todos.read();
      res.writeHead(200);
      res.end(JSON.stringify(todoss));
    } catch {
      res.writeHead(404);
      res.end(JSON.stringify({ massage: "Error reading todo" }));
    }

    // id bo'yicha ko'rish
  } else if (req.url.startsWith("/todo/") && req.method == "GET") {
    try {
      const todos = await Todos.read();
      const id = req.url.split("/")[2];

      const findTodo = todos.find((todo) => todo.id == id);
      res.writeHead(200);
      res.end(JSON.stringify(findTodo));
    } catch {
      res.writeHead(403);
      res.end(JSON.stringify({ massage: "Error request" }));
    }
  }
  //   id bo'yicha delete qilish
  else if (req.url.startsWith("/todo/") && req.method == "DELETE") {
    try {
      const todos = await Todos.read();
      const id = req.url.split("/")[2];

      const findTodo = todos.find((todo) => todo.id == id);
      if (!findTodo) {
        res.writeHead(404);
        res.end(JSON.stringify({ massage: "Todo not found" }));
      }
      const data = todos.filter((todo) => todo.id != id);
      Todos.write(data);
      res.writeHead(203);
      res.end(JSON.stringify({ success: "Deleted todo" }));
    } catch {
      res.writeHead(404);
      res.end(JSON.stringify({ success: "Error deleted todo" }));
    }
  }
  //   edite qilish
  else if (req.url.startsWith("/todo/") && req.method == "PUT") {
    const id = Number(req.url.split("/")[2]);

    req.body = await parser(req);
    const { title, text } = req.body;

    const todos = await Todos.read();
    const findTodo = todos.find((todo) => todo.id == id);
    if (!findTodo) {
      res.writeHead(404);
      res.end(JSON.stringify({ massage: "Todo not found!" }));
    }
    const data = todos.map((todo) =>
      todo.id == id ? { ...todo, title: title, text: text } : todo
    );
    Todos.write(data);
    res.writeHead(201);
    res.end(JSON.stringify({ success: "Upload todo" }));
  }
});
server.listen(3300);
