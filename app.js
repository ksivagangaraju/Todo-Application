const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/todos/", async (request, response) => {
  const { priority = "", status = "", search_q = "" } = request.query;
  const getTodosQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      priority LIKE '%${priority}%' AND
      status LIKE '%${status}%' AND
      todo LIKE '%${search_q}%';`;
  const todos = await db.all(getTodosQuery);
  response.send(todos);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`;
  const todo = await db.get(getTodoQuery);
  response.send(todo);
});

app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const createTodoQuery = `
    INSERT INTO
      todo (id, todo, priority, status)
    VALUES
      (${id}, '${todo}', '${priority}', '${status}');`;
  await db.run(createTodoQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const todoDetails = request.body;
  const { todo = "", priority = "", status = "" } = todoDetails;
  if (todo !== "") {
    const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo = '${todo}'
    WHERE
      id = ${todoId};`;
    await db.run(updateTodoQuery);
    response.send("Todo Updated");
  }
  if (priority !== "") {
    const updateTodoQuery = `
    UPDATE
      todo
    SET
      priority = '${priority}'
    WHERE
      id = ${todoId};`;
    await db.run(updateTodoQuery);
    response.send("Priority Updated");
  }
  if (status !== "") {
    const updateTodoQuery = `
    UPDATE
      todo
    SET
      status = '${status}'
    WHERE
      id = ${todoId};`;
    await db.run(updateTodoQuery);
    response.send("Status Updated");
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM
      todo
    WHERE
      id = ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
