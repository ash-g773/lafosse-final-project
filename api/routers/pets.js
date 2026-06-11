const { Router } = require("express");
const petController = require("../controller/pets");
const authenticator = require("../middleware/authenticator");
const upload = require("../middleware/upload.middleware");
 
const petRouter = Router();

petRouter.get("/", petController.index);
petRouter.get("/:id", petController.show);
petRouter.post("/", authenticator, upload.single("image"), petController.create);
 
module.exports = petRouter;
