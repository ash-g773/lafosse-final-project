const { Router } = require("express");
const petController = require("../controller/pets");
const authenticator = require("../middleware/authenticator");
 
const petRouter = Router();

petRouter.get("/", petController.index);
petRouter.get("/:id", petController.show);
petRouter.post("/", authenticator, petController.create);
 
module.exports = petRouter;
