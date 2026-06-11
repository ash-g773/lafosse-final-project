const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const usersRouter = require("./routers/users")

const app = express();

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"))
}

app.get("/", (req, res) => {
  res.send({ message: "welcome", description: "Paws API" })
})

app.use("/users", usersRouter)

module.exports = app;
