const { Router } = require("express");
const sightingController = require("../controller/sightings");
 
const sightingRouter = Router();

//sightingRouter.get("/", sightingController.index);
//sightingRouter.get("/:id", sightingController.show);
sightingRouter.post("/", sightingController.create);
 
module.exports = sightingRouter;