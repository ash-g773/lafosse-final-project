const db = require("../database/connect")

class Alert {
    constructor({ alerts_id, users_id, pets_id, alert_type, alert_message, alert_radius, is_read, created_at }) {
        this.alerts_id = alerts_id
        this.users_id = users_id
        this.pets_id = pets_id
        this.alert_type = alert_type
        this.alert_message = alert_message
        this.alert_radius = alert_radius
        this.is_read = is_read
        this.created_at = created_at
    }

    static async getByUserId(users_id) {
        const response = await db.query("SELECT * FROM alerts WHERE users_id = $1 ORDER BY created_at DESC;", [users_id])
        return response.rows.map(a => new Alert(a))
    }

    static async markAsRead(alerts_id) {
        const response = await db.query("UPDATE alerts SET is_read = true WHERE alerts_id = $1 RETURNING *;", [alerts_id])
        if (response.rows.length !== 1) throw new Error("Alert not found.")
        return new Alert(response.rows[0])
    }

    static async createForAllUsers(pets_id, alert_type, alert_message) {
        const users = await db.query("SELECT users_id FROM users;")
        for (const user of users.rows) {
            await db.query("INSERT INTO alerts (users_id, pets_id, alert_type, alert_message) VALUES ($1, $2, $3, $4);", [user.users_id, pets_id, alert_type, alert_message])
        }
    }
}

module.exports = Alert