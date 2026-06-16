const Pet = require("../model/Pet");
const { getAiMatches } = require("../utils/gemini.utils");

async function match(req, res) {
  try {
    // Validate pet ID
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid pet ID" });
    }

    // Test connectivity (optional, but useful for debugging)
    try {
      const testResponse = await fetch("https://httpbin.org/get");
      console.log("Connectivity test status:", testResponse.status);
    } catch (connectivityErr) {
      console.error("Connectivity test failed:", connectivityErr.message);
      // Proceed anyway, as this is just a test
    }

    // Fetch pet
    const pet = await Pet.getOneById(id);
    if (!pet) {
      return res.status(404).json({ error: "Pet not found" });
    }

    // Validate pet location
    if (pet.lat === undefined || pet.lng === undefined) {
      return res.status(400).json({ error: "Pet location data is missing" });
    }

    // Fetch nearby sightings
    const sightings = await Pet.getNearbySightings(pet.lat, pet.lng);
    if (sightings.length === 0) {
      return res.status(200).json({
        matches: [],
        summary: "No recent sightings found in your area in the last 7 days.",
      });
    }

    // Call AI matching
    const result = await getAiMatches(pet, sightings);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in match controller:", err);

    if (err.message === "Pet not found") {
      res.status(404).json({ error: err.message });
    } else if (
      err.message.includes("Gemini API error") ||
      err.message.includes("timed out")
    ) {
      res
        .status(502)
        .json({ error: "AI service unavailable, please try again" });
    } else if (
      err instanceof SyntaxError ||
      err.message.includes("Failed to parse")
    ) {
      res
        .status(500)
        .json({ error: "AI response was invalid, please try again" });
    } else {
      res
        .status(500)
        .json({ error: err.message || "An unexpected error occurred" });
    }
  }
}

module.exports = { match };
