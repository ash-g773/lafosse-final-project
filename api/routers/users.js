const { Router } = require("express")
const usersController = require("../controller/users")
const usersRouter = Router()

usersRouter.get("/:username", usersController.show)
usersRouter.post("/register", usersController.register)
usersRouter.post("/login", usersController.login)

module.exports = usersRouter