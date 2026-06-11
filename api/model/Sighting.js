const db = require("../database/connect");

class Sighting {
    constructor({ id, pet_id, user_id, guest_contact, description, location_description, lat, lng, image_url,created_at }) {
        this.id = id;
        this.pet_id = pet_id;
        this.user_id = user_id;
        this.guest_contact = guest_contact;
        this.description = description;
        this.location_description = location_description;
        this.lat = lat;
        this.lng = lng;
        this.image_url = image_url;
        this.created_at = created_at;
    }

    static async create(data) {
    const { pet_id, user_id, guest_contact, description, location_description, lat, lng, image_url } = data;
    const response = await db.query(
      `INSERT INTO sightings (pet_id, user_id, guest_contact, description, location_description, lat, lng, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *;`,
      [pet_id, user_id, guest_contact, description, location_description, lat, lng, image_url]
    );
    return new Sighting(response.rows[0]);
  }
}

module.exports = Sighting;