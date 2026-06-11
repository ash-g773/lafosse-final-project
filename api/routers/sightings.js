const { Router } = require("express");
const sightingController = require("../controller/sightings");
const upload = require("../middleware/upload.middleware");
 
const sightingRouter = Router();

sightingRouter.get("/", sightingController.index);
sightingRouter.get("/:id", sightingController.show);
sightingRouter.post("/", upload.single("image"), sightingController.create);
 
module.exports = sightingRouter;