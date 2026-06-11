const Sighting = require("../model/Sighting");

async function create(req, res) {
   try {
    const data = req.body;
    const newSighting = await Sighting.create(data);
    res.status(201).json(newSighting);
  } catch (err) {
    res.status(400).json({ error: err.message });
  } 
}

module.exports = { create };