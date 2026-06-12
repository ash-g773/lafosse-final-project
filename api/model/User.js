const db = require("../database/connect")

class User {
  constructor({ users_id, username, password, created_at }) {
    this.users_id = users_id
    this.username = username
    this.password = password
    this.created_at = created_at
  }

  static async getOneById(id) {
    const response = await db.query("SELECT * FROM users WHERE users_id = $1;", [id])
    if (response.rows.length !== 1) {
      throw new Error("Unable to locate user.")
    }
    return new User(response.rows[0])
  }

  static async getOneByUsername(username) {
    const response = await db.query("SELECT * FROM users WHERE username = $1;", [username])
    if (response.rows.length !== 1) {
      throw new Error("Unable to locate user.")
    }
    return new User(response.rows[0])
  }

  static async create(data) {
    const { username, password } = data

    if (!username || !password) {
      throw new Error("Missing required fields.")
    }

    const response = await db.query("INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *;", [username, password])
    const newId = response.rows[0].users_id
    const newUser = await User.getOneById(newId)

    return new User(newUser)
  }
}

module.exports = User
