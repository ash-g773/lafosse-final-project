const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    title: "API",
    description: "Lost pet recovery API",
  });
});

module.exports = app;
