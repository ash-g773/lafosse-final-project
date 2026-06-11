const Pet = require("../model/Pet");

async function index(req, res) {
  try {
    const pets = await Pet.getAll();
    res.status(200).json(pets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


async function show(req, res) {
    try {
        const id = parseInt(req.params.id);
        const pet = await Pet.getOneById(id);
        res.status(200).json(pet);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
}


async function create(req, res) {
   try {
    const data = req.body;
    const newPet = await Pet.create(data);
    res.status(201).json(newPet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  } 
}

module.exports = { index, show, create };