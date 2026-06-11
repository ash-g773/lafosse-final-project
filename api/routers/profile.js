const { Router } = require("express")
const profileController = require("../controller/profile")

const profileRouter = Router()

profileRouter.get("/:users_id", profileController.getProfile)
profileRouter.patch("/:users_id", profileController.updateProfile)
profileRouter.get("/:users_id/pets", profileController.getUserPets)
profileRouter.get("/:users_id/sightings", profileController.getUserSightings)

module.exports = profileRouter