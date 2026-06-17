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
    const species = pet.species.toLowerCase();

    // Species conflicts
    const speciesConflicts = {
      cat: ["dog"],
      dog: ["cat"],
      tortoise: ["cat", "dog"],
    };
    if (
      speciesConflicts[species]?.some((conflict) => desc.includes(conflict))
    ) {
      return -1000;
    }

    // Species match
    if (desc.includes(species)) score += 100;

    // Breed match
    if (pet.breed && desc.includes(pet.breed.toLowerCase())) score += 30;

    // Colour match (increased weight)
    if (pet.colour) {
      const colours = pet.colour.toLowerCase().split(/[ ,/]+/);
      const ignore = new Set(["and", "with", "the", "tabby"]);
      for (const colour of colours) {
        if (colour.length > 2 && !ignore.has(colour) && desc.includes(colour)) {
          score += 70;
        }
      }
    }

    // Tabby bonus
    if (pet.colour?.toLowerCase().includes("tabby") && desc.includes("tabby")) {
      score += 30;
    }

    // Tortoiseshell bonus
    if (
      pet.colour?.toLowerCase().includes("tortoiseshell") &&
      desc.includes("tortoiseshell")
    ) {
      score += 30;
    }

    // Name match
    if (pet.name && desc.includes(pet.name.toLowerCase())) {
      score += 100;
    }

    // Distance scoring
    const distanceThresholds = [
      { max: 50, points: 100 },
      { max: 100, points: 80 },
      { max: 250, points: 60 },
      { max: 500, points: 40 },
    ];
    for (const { max, points } of distanceThresholds) {
      if (distance < max) {
        score += points;
        break;
      }
    }

    // Age scoring (increased weight for recent sightings)
    const ageThresholds = [
      { max: 1, points: 40 },
      { max: 3, points: 20 },
      { max: 7, points: 10 },
    ];
    for (const { max, points } of ageThresholds) {
      if (ageDays < max) {
        score += points;
        break;
      }
    }

    // Bonus for longer descriptions
    if (desc.length > 20) {
      score += 20;
    }
    if (desc.length > 50) {
      score += 10; // Additional bonus
    }

    return score;
  }

  // Score all sightings
  const scored = sightings.map((s) => ({
    ...s,
    score: scoreSighting(pet, s),
  }));
  scored.sort((a, b) => b.score - a.score);

  // Filter candidates
  const candidates = scored.filter((s) => s.score >= 60);
  if (candidates.length === 0) {
    return {
      matches: [],
      summary: "No likely matches found",
    };
  }

  // helper function - create match object with sighting
  function createMatch(sighting, likelihood, reasoning, nextSteps) {
    return {
      sighting_id: sighting.sightings_id,
      likelihood,
      reasoning,
      next_steps: nextSteps,
      sighting: sighting, // Always include the sighting object
    };
  }

  // Always return:
  // 1. Top match as "High" (if score >= 80)
  // 2. Next 2 matches as "Medium" (if score >= 60)
  const matches = [];
  const top = candidates[0];

  // 1. Add the top match as "High" (if score >= 80)
  if (top.score >= 80) {
    matches.push(
      createMatch(
        top,
        "High",
        `Strong match: ${pet.species} (${pet.colour}) seen ${distance.toFixed(0)}m away, ${ageDays.toFixed(0)} days ago.`,
        "Contact the reporter as soon as possible.",
      ),
    );
  } else {
    // If top score is < 80, treat it as Medium
    matches.push(
      createMatch(
        top,
        "Medium",
        `Possible match: Similar ${pet.species} but ${distance > 250 ? "farther away" : "less detail"}.`,
        "Review this sighting.",
      ),
    );
  }

  // 2. Add up to 2 more matches as "Medium" (if they exist and score >= 60)
  for (let i = 1; i <= Math.min(2, candidates.length - 1); i++) {
    const candidate = candidates[i];
    if (candidate.score >= 60) {
      matches.push(
        createMatch(
          candidate,
          "Medium",
          "Possible match based on key details.",
          "Review this sighting.",
        ),
      );
    }
  }

  // If we have matches, return them
  if (matches.length > 0) {
    return {
      matches: matches.slice(0, 3), // Ensure max 3 matches (1 High + 2 Medium)
      summary:
        matches.length === 1
          ? "We found one promising match."
          : `We found ${matches.length} possible matches.`,
    };
  }

  // Fallback: Use Gemini API for ambiguous cases (optional)
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

    if (!response.ok) {
      throw new Error(
        `Gemini API error: ${response.status} - ${await response.text()}`,
      );
    }

    const data = await response.json();
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

    let aiResult;
    try {
      aiResult = JSON.parse(cleaned);
    } catch (err) {
      throw new Error("Failed to parse Gemini response as JSON");
    }

    // Enrich AI matches with sighting objects
    const enrichedMatches = aiResult.matches.map((match) => {
      const sighting = topSightings.find(
        (s) => s.sightings_id === match.sighting_id,
      );
      return { ...match, sighting };
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
