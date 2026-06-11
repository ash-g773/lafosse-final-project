const { Router } = require("express");
const petController = require("../controllers/pets");
 
const petRouter = Router();

petRouter.get("/", petController.index);
petRouter.get("/:id", petController.show);
petRouter.post("/", petController.create);
 
module.exports = petRouter;
