const { Router } = require("express")
const profileController = require("../controller/profile")
const authenticator = require("../middleware/authenticator")

const profileRouter = Router()

profileRouter.get("/:users_id", authenticator, profileController.getProfile)
profileRouter.patch("/:users_id", authenticator, profileController.updateProfile)
profileRouter.get("/:users_id/pets", authenticator, profileController.getUserPets)
profileRouter.get("/:users_id/sightings", authenticator, profileController.getUserSightings)

module.exports = profileRouter