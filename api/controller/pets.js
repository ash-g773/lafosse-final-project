const Pet = require("../model/Pet");
const uploadToCloudinary = require('../utils/cloudinary.utils')

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
        const data = req.body
        if (req.file) {
            data.image_url = await uploadToCloudinary(req.file.buffer)
        } else {
            data.image_url = null
        }
        const newPet = await Pet.create(data);
        res.status(201).json(newPet);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

module.exports = { index, show, create };