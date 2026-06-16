async function getAiMatches(pet, sightings) {
  function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // metres

    const toRad = (deg) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function scoreSighting(pet, sighting) {
    let score = 0;

    const distance = haversineDistance(
      Number(pet.lat),
      Number(pet.lng),
      Number(sighting.lat),
      Number(sighting.lng),
    );

    const ageDays =
      (Date.now() - new Date(sighting.created_at).getTime()) /
      (1000 * 60 * 60 * 24);
    const desc = (sighting.sighting_description || "").toLowerCase();

    // Species
    const species = pet.species.toLowerCase();

    if (species === "cat" && desc.includes("dog")) return -1000;
    if (species === "dog" && desc.includes("cat")) return -1000;
    if (
      species === "tortoise" &&
      (desc.includes("cat") || desc.includes("dog"))
    ) {
      return -1000;
    }

    if (desc.includes(species)) {
      score += 100;
    }

    // Breed
    if (pet.breed && desc.includes(pet.breed.toLowerCase())) score += 30;

    // Colour
    if (pet.colour) {
      const colours = pet.colour.toLowerCase().split(/[ ,/]+/);

      const ignore = new Set(["and", "with", "the", "light", "dark"]);

      for (const colour of colours) {
        if (colour.length > 2 && !ignore.has(colour) && desc.includes(colour)) {
          score += 30;
        }
      }
    }

    // Name
    if (pet.name && desc.includes(pet.name.toLowerCase())) {
      score += 100;
    }

    if (distance < 250) score += 60;
    else if (distance < 1000) score += 40;
    else if (distance < 3000) score += 20;

    if (ageDays < 1) score += 30;
    else if (ageDays < 3) score += 20;
    else if (ageDays < 7) score += 10;

    return score;
  }
  const scored = sightings.map((s) => ({
    ...s,
    score: scoreSighting(pet, s),
  }));
  scored.sort((a, b) => b.score - a.score);
}

const candidates = scored.filter((s) => s.score >= 80);
if (candidates.length === 0) {
  return {
    matches: [],
    summary: "No likely matches found",
  };

  const top = candidates[0];
  const second = candidates[1];

  const scoreGap = top && second ? top.score - second.score : 999;

  if (top && top.score >= 180 && scoreGap > 20) {
    console.log(best, best.score);
    return {
      matches: [
        {
          sighting_id: best.sightings_id,
          likelihood: "High",
          reasoning: "Very strong automatic match based on key details.",
          next_steps: "Contact the reporter as soon as possible.",
        },
      ],
      summary: "We found a highly promising match.",
    };
  }

  if (!top || top.score < 80) {
    return {
      matches: [],
      summary: "No likely matches found.",
    };
  }

  if (candidates.length === 1 && top.score >= 140) {
    return {
      matches: [
        {
          sighting_id: best.sightings_id,
          likelihood: "Medium",
          reasoning: "Likely match based on the available information.",
          next_steps: "Review this sighting.",
        },
      ],
      summary: "We found one promising sighting.",
    };
  }

  const needsAi =
    top && top.score < 180 && candidates.length > 1 && scoreGap < 30;

  if (!needsAi) {
    return {
      matches: candidates.slice(0, 3).map((s) => ({
        sighting_id: s.sightings_id,
        likelihood: "Medium",
        reasoning: "Rule-based match.",
        next_steps: "Review this sighting.",
      })),
      summary: "We found some possible matches.",
    };
  }

  const topSightings = candidates.slice(0, 5);

  const prompt = `
 Compare this lost pet against the candidate sightings.

Lost pet:
${JSON.stringify({
  species: pet.species,
  breed: pet.breed,
  colour: pet.colour,
  description: pet.description,
  last_seen: pet.last_seen_location,
})}

Candidate sightings:
${JSON.stringify(
  topSightings.map((s) => ({
    sighting_id: s.sightings_id,
    description: s.sighting_description,
    location: s.location_description,
    reported: s.created_at,
  })),
  null,
  2,
)}

Return ONLY valid JSON.

{
  "matches": [
    {
      "sighting_id": 123,
      "likelihood": "High",
      "reasoning": "...",
      "next_steps": "..."
    }
  ],
  "summary": "..."
}

Do not include markdown.
Do not invent sighting IDs.
If none of the candidate sightings are a reasonable match,
return:

{
  "matches": [],
  "summary": "No likely matches found."
}

Only include High, Medium or Low confidence matches that are genuinely plausible.`;

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
    if (
      !data.candidates?.length ||
      !data.candidates[0].content?.parts?.length
    ) {
      throw new Error("Gemini returned no content");
    }

    const text = data.candidates[0].content.parts[0].text;
    const cleaned = text
      .replace(/^```[^\n]*\n?/, "")
      .replace(/\n?```$/, "")
      .trim();
    const aiResult = JSON.parse(cleaned);

    const enrichedMatches = aiResult.matches.map((match) => {
      const sighting = topSightings.find(
        (s) => s.sightings_id === match.sighting_id,
      );

      return {
        ...match,
        sighting,
      };
    });

    return {
      ...aiResult,
      matches: enrichedMatches,
    };
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      throw new Error("Gemini API timed out");
    }
    throw err;
  }
}

module.exports = { getAiMatches };
