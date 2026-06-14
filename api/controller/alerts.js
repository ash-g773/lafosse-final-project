const Alert = require("../model/Alert")

async function getAlerts(req, res) {
  try {
    const users_id = parseInt(req.params.users_id)
    const alerts = await Alert.getByUserId(users_id)
    res.status(200).json({ data: alerts })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function markRead(req, res) {
  try {
    const alerts_id = parseInt(req.params.alerts_id)
    const alert = await Alert.markAsRead(alerts_id)
    res.status(200).json({ data: alert })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

module.exports = { getAlerts, markRead }