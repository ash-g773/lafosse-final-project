async function getAiMatches(pet, sightings) {
  const prompt = `
    I am looking for my lost pet. Here are the details:
    - Name: ${pet.name}
    - Species: ${pet.species}
    - Breed: ${pet.breed || "Unknown"}
    - Colour: ${pet.colour || "Unknown"}
    - Description: ${pet.description || "No description"}
    - Last seen: ${pet.last_seen_location}

    Here are recent sightings in the area. For each one assess:
    1. How likely it is to be my pet (High/Medium/Low/Unlikely)
    2. Why you think that

    Sightings:
    ${sightings
      .map(
        (s, i) => `
      Sighting ${i + 1} (ID: ${s.sightings_id}):
      - Description: ${s.sighting_description}
      - Location: ${s.location_description || "Not specified"}
      - Reported: ${new Date(s.created_at).toLocaleDateString()}
    `,
      )
      .join("\n")}

    Respond ONLY in this exact JSON format, no markdown, no extra text:
    {
      "matches": [
        {
          "sighting_id": 1,
          "likelihood": "High",
          "reasoning": "explanation here",
        }
      ],
      "summary": "One sentence overall assessment"
    }
  `;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;

  // clean markdown if Gemini adds it despite instructions
  const cleaned = text.replace(/```json|```/g, "").trim();

  return JSON.parse(cleaned);
}

module.exports = { getAiMatches };
