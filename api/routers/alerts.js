const { Router } = require("express")
const alertsController = require("../controller/alerts")
const authenticator = require("../middleware/authenticator")

const alertsRouter = Router()

alertsRouter.get("/:users_id", authenticator, alertsController.getAlerts)
alertsRouter.patch("/:alerts_id/read", authenticator, alertsController.markRead)

module.exports = alertsRouter