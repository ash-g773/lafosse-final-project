const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const usersRouter = require("./routers/users")
const petRouter = require("./routers/pets")
const sightingRouter = require("./routers/sightings")

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
app.use("/pets", petRouter)
app.use("/sightings", sightingRouter)

module.exports = app;
