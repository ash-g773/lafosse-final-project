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
      "INSERT INTO profiles (users_id) VALUES ($1) RETURNING *;",[users_id])
    return new Profile(response.rows[0])
  }

  static async getProfileByUserId(users_id) {
    const response = await db.query(
      "SELECT * FROM profiles WHERE users_id = $1;",[users_id])
    if (response.rows.length !== 1) throw new Error("Profile not found.")
    return new Profile(response.rows[0])
  }

  static async updateProfile(users_id, data) {
    const { full_name, phone, postcode, lat, lng, alert_radius } = data
    const response = await db.query(
      "UPDATE profiles SET full_name = $1, phone = $2, postcode = $3, lat = $4, lng = $5, alert_radius = $6 WHERE users_id = $7 RETURNING *;", [full_name, phone, postcode, lat, lng, alert_radius, users_id])
    if (response.rows.length !== 1) throw new Error("Unable to update profile.")
    return new Profile(response.rows[0])
  }

  static async getPetsByUserId(users_id) {
    const response = await db.query(
      "SELECT * FROM pets WHERE users_id = $1 ORDER BY created_at DESC;",[users_id])
    return response.rows
  }

  static async getSightingsByUserId(users_id) {
    const response = await db.query(
      "SELECT * FROM sightings WHERE users_id = $1 ORDER BY created_at DESC;",[users_id])
    return response.rows
  }
}

module.exports = Profile