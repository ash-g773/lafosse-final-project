require("dotenv").config();

const fs = require("fs");
const db = require("./connect");

const sql = fs.readFileSync("./database/schema.sql").toString();

db.query(sql)
  .then(() => {
    db.end();
    console.log("Database setup complete");
  })
  .catch((err) => {
    console.log(err);
  });
