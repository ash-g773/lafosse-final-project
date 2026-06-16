async function getAiMatches(pet, sightings) {
  const relevantSightings = sightings.filter((s) => {
    const desc = s.sighting_description.toLowerCase();
    const species = pet.species.toLowerCase();
    // basic species filtering - if sighting mentions a different species, exclude it
    if (
      species === "cat" &&
      (desc.includes("dog") || desc.includes("tortoise"))
    )
      return false;
    if (
      species === "dog" &&
      (desc.includes("cat") || desc.includes("tortoise"))
    )
      return false;
    return true;
  });

  if (relevantSightings.length === 0) {
    return {
      matches: [],
      summary: `No recent sightings of ${pet.species.toLowerCase()}s found in your area.`,
    };
  }

  const prompt = `
    You are helping reunite a lost pet with their owner.
    
    LOST PET DETAILS:
    - Species: ${pet.species} (CRITICAL: only match sightings of this exact species)
    - Name: ${pet.name}
    - Breed: ${pet.breed || "Unknown"}
    - Colour/markings: ${pet.colour || "Unknown"}
    - Description: ${pet.description || "No description"}
    - Last seen near: ${pet.last_seen_location}

    MATCHING RULES - assess in this strict priority order:
    1. SPECIES MATCH IS MANDATORY - if a sighting describes a different animal species, likelihood must be "Unlikely" regardless of anything else
    2. Physical characteristics (colour, size, breed, markings) - most important after species
    3. Location proximity - how close to last seen location
    4. Behaviour - least important, only use to support or contradict physical match

    RECENT SIGHTINGS TO ASSESS:
    ${relevantSightings
      .map(
        (s, i) => `
      Sighting ${i + 1}:
      - Description: ${s.sighting_description}
      - Location: ${s.location_description || "Not specified"}
      - Reported: ${new Date(s.created_at).toLocaleDateString()}
    `,
      )
      .join("\n")}

    IMPORTANT RULES FOR YOUR RESPONSE:
    - Do NOT reference sighting numbers or IDs in your reasoning or summary
    - Do NOT include "Unlikely" matches in the results at all - only return High, Medium or Low matches
    - Keep reasoning focused on physical appearance first
    - Summary should be written directly to the pet owner, not reference technical details
    - If no sightings are a reasonable match, return an empty matches array with an encouraging summary

    Respond ONLY in this exact JSON format, no markdown, no extra text:
    {
      "matches": [
        {
          "sighting_id": ${relevantSightings[0]?.sightings_id},
          "likelihood": "High",
          "reasoning": "Physical description matches closely - same colour and size reported in a nearby location.",
          "next_steps": "We recommend visiting this area as soon as possible."
        }
      ],
      "summary": "We found 1 possible match for your pet in the area. Check the details below."
    }
  `;

  console.log("Calling Gemini API...");
  console.log("API Key exists:", !!process.env.GEMINI_MATCHING_KEY);
  console.log(
    "API Key prefix:",
    process.env.GEMINI_MATCHING_KEY?.substring(0, 8),
  );
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    console.log("Aborting - timeout reached");
    controller.abort();
  }, 15000);
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_MATCHING_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
        signal: controller.signal,
      },
    );
    clearTimeout(timeout);

    console.log("Gemini response status:", response.status);
    const responseText = await response.text();
    console.log("Gemini response body:", responseText.substring(0, 200));

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} - ${responseText}`);
    }

    const data = JSON.parse(responseText);
    const text = data.candidates[0].content.parts[0].text;
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      throw new Error("Gemini API timed out");
    }
    throw err;
  }
}

module.exports = { getAiMatches };
