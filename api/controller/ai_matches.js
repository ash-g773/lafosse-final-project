const Pet = require("../model/Pet");
const { getAiMatches } = require("../utils/gemini.utils");

async function match(req, res) {
  try {
    console.log("Testing connectivity...");
    const testResponse = await fetch("https://httpbin.org/get");
    console.log("Connectivity test status:", testResponse.status);

    const id = parseInt(req.params.id);

    const pet = await Pet.getOneById(id);

    const sightings = await Pet.getNearbySightings(pet.lat, pet.lng);

    if (sightings.length === 0) {
      return res.status(200).json({
        matches: [],
        summary: "No recent sightings found in your area in the last 7 days.",
      });
    }

    const result = await getAiMatches(pet, sightings);
    res.status(200).json(result);
  } catch (err) {
    if (err.message === "Pet not found") {
      res.status(404).json({ error: err.message });
    } else if (err.message.includes("Gemini API error")) {
      res
        .status(502)
        .json({ error: "AI service unavailable, please try again" });
    } else if (err instanceof SyntaxError) {
      res
        .status(500)
        .json({ error: "AI response was invalid, please try again" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
}
module.exports = { match };
