const Sighting = require("../model/Sighting");

async function index(req, res) {
    try {
        const sightings = await Sighting.getAll();
        res.status(200).json(sightings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function show(req, res) {
    try {
        const id = parseInt(req.params.id);
        const sighting = await Sighting.getOneById(id);
        res.status(200).json(sighting);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
}

async function create(req, res) {
    try {
        const data = req.body;
        const newSighting = await Sighting.create(data);
        res.status(201).json(newSighting);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

module.exports = { index, show, create };