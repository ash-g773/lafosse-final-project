const Profile = require("../model/Profile")

async function getProfile(req, res) {
    try {
        const users_id = parseInt(req.params.users_id)
        const profile = await Profile.getProfileByUserId(users_id)
        res.status(200).json({ data: profile })
    } catch (err) {
        res.status(404).json({ error: err.message })
    }
}

async function updateProfile(req, res) {
    try {
        const users_id = parseInt(req.params.users_id)
        const updated = await Profile.updateProfile(users_id, req.body)
        res.status(200).json({ data: updated })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

async function getUserPets(req, res) {
    try {
        const users_id = parseInt(req.params.users_id)
        const pets = await Profile.getPetsByUserId(users_id)
        res.status(200).json({ data: pets })
    } catch (err) {
        res.status(404).json({ error: err.message })
    }
}

async function getUserSightings(req, res) {
    try {
        const users_id = parseInt(req.params.users_id)
        const sightings = await Profile.getSightingsByUserId(users_id)
        res.status(200).json({ data: sightings })
    } catch (err) {
        res.status(404).json({ error: err.message })
    }
}

module.exports = { getProfile, updateProfile, getUserPets, getUserSightings }