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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_MATCHING_KEY}`,
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
