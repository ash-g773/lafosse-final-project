const db = require("../database/connect")

class Profile {
  constructor({ profiles_id, users_id, full_name, phone, postcode, lat, lng, alert_radius, created_at }) {
    this.profiles_id = profiles_id
    this.users_id = users_id
    this.full_name = full_name
    this.phone = phone
    this.postcode = postcode
    this.lat = lat
    this.lng = lng
    this.alert_radius = alert_radius
    this.created_at = created_at
  }

  static async createProfile(users_id) {
    const response = await db.query(
      "INSERT INTO profiles (users_id) VALUES ($1) RETURNING *;",
      [users_id]
    )
    return new Profile(response.rows[0])
  }
}

module.exports = Profile