const { Router } = require("express");
const petController = require("../controller/pets");
const authenticator = require("../middleware/authenticator");
const upload = require("../middleware/upload.middleware");
const ai = require("../controller/ai_matches");

const petRouter = Router();

petRouter.get("/", petController.index);
petRouter.get("/:id", petController.show);
petRouter.post(
  "/",
  authenticator,
  upload.single("image"),
  petController.create,
);
petRouter.patch("/:id/status", authenticator, petController.update);

petRouter.get("/:id/ai-matches", authenticator, ai.match);

module.exports = petRouter;
