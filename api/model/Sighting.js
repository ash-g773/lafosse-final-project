const db = require("../database/connect");

class Sighting {
    constructor({ sightings_id, pets_id, users_id, guest_contact, sighting_description, location_description, lat, lng, image_url, created_at }) {
        this.sightings_id = sightings_id;
        this.pets_id = pets_id;
        this.users_id = users_id;
        this.guest_contact = guest_contact;
        this.sighting_description = sighting_description;
        this.location_description = location_description;
        this.lat = lat;
        this.lng = lng;
        this.image_url = image_url;
        this.created_at = created_at;
    }

    static async getAll() {
        const response = await db.query("SELECT * FROM sightings ORDER BY created_at DESC;");
        return response.rows.map(s => new Sighting(s));
    }

    static async getOneById(id) {
        const response = await db.query("SELECT * FROM sightings WHERE sightings_id = $1;", [id]);
        if (response.rows.length !== 1) throw new Error("Sighting not found.");
        return new Sighting(response.rows[0]);
    }

    static async create(data) {
        const { pets_id, users_id, guest_contact, sighting_description, location_description, lat, lng, image_url } = data;
        const response = await db.query(
            `INSERT INTO sightings (pets_id, users_id, guest_contact, sighting_description, location_description, lat, lng, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`, [pets_id, users_id, guest_contact, sighting_description, location_description, lat, lng, image_url]);
        return new Sighting(response.rows[0]);
    }
}

module.exports = Sighting;