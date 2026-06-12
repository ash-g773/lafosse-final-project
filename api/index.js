require("dotenv").config();

const api = require("./app");
const port = process.env.PORT || 3000;

api.listen(port, "0.0.0.0", () => {
  console.log(`API listening on ${port}`);
});
