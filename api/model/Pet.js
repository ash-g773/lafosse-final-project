const db = require("../database/connect");

class Pet {
  constructor({ pets_id, users_id, name, species, breed, colour, description, last_seen_location, lat, lng, image_url, status, created_at }) {
    this.pets_id = pets_id;
    this.users_id = users_id;
    this.name = name;
    this.species = species;
    this.breed = breed;
    this.colour = colour;
    this.description = description;
    this.last_seen_location = last_seen_location;
    this.lat = lat;
    this.lng = lng;
    this.image_url = image_url;
    this.status = status;
    this.created_at = created_at;
  }


  static async getAll() {
    const response = await db.query("SELECT * FROM pets ORDER BY created_at DESC;");
    if (response.rows.length === 0) {
      throw new Error("No pets available.");
    }
    return response.rows.map(p => new Pet(p));
  }

  static async getOneById(id) {
    const response = await db.query("SELECT * FROM pets WHERE pets_id = $1;", [id]);
    if (response.rows.length !== 1) {
      throw new Error("Pet not found.");
    }
    return new Pet(response.rows[0]);
  }

  static async create(data) {
    const { users_id, name, species, breed, colour, description, last_seen_location, lat, lng, image_url } = data;
    const response = await db.query(
      `INSERT INTO pets (users_id, name, species, breed, colour, description, last_seen_location, lat, lng, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *;`,
      [users_id, name, species, breed, colour, description, last_seen_location, lat, lng, image_url]
    );
    return new Pet(response.rows[0]);
  }
}

module.exports = Pet;