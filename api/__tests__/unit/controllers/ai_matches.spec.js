const request = require("supertest");
const app = require("../../../app");

// mock Pet model
jest.mock("../../../model/Pet", () => ({
  getOneById: jest.fn(),
  getNearbySightings: jest.fn(),
}));

// mock gemini utils
jest.mock("../../../utils/gemini.utils", () => ({
  getAiMatches: jest.fn(),
}));

// mock fetch for connectivity test
global.fetch = jest.fn();

jest.mock("../../../middleware/authenticator", () => {
  return (req, res, next) => next(); // just skip auth in tests
});

const Pet = require("../../../model/Pet");
const { getAiMatches } = require("../../../utils/gemini.utils");

const mockPet = {
  pets_id: 1,
  name: "Luna",
  species: "Cat",
  breed: null,
  colour: "Black",
  description: "Very friendly black cat",
  last_seen_location: "Thorpedale Road",
  lat: "51.566691",
  lng: "-0.119936",
  status: "lost",
};

const mockSightings = [
  {
    sightings_id: 1,
    sighting_description: "Black cat spotted near park",
    location_description: "Near basketball courts",
    lat: "51.5657",
    lng: "-0.1174",
    created_at: "2024-01-01",
  },
];

const mockAiResult = {
  matches: [
    {
      sighting_id: 1,
      likelihood: "High",
      reasoning: "Black cat matching description",
      next_steps: "Visit the area soon",
    },
  ],
  summary: "Found one possible match nearby",
};

beforeEach(() => {
  jest.clearAllMocks();
  // mock connectivity test fetch
  global.fetch.mockResolvedValue({ status: 200 });
});

describe("GET /pets/:id/ai-matches", () => {
  it("returns 400 for invalid pet ID", async () => {
    const response = await request(app)
      .get("/pets/notanumber/ai-matches")
      .set("Authorization", "Bearer fake-token");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid pet ID");
  });

  it("returns error when pet not found", async () => {
    Pet.getOneById.mockRejectedValue(new Error("Pet not found."));

    const response = await request(app)
      .get("/pets/999/ai-matches")
      .set("Authorization", "Bearer fake-token");

    expect(response.status).toBe(500);
  });

  it("returns empty matches when no sightings nearby", async () => {
    Pet.getOneById.mockResolvedValue(mockPet);
    Pet.getNearbySightings.mockResolvedValue([]);

    const response = await request(app)
      .get("/pets/1/ai-matches")
      .set("Authorization", "Bearer fake-token");

    expect(response.status).toBe(200);
    expect(response.body.matches).toHaveLength(0);
    expect(response.body.summary).toContain("No recent sightings");
  });

  it("returns ai matches with sighting data attached", async () => {
    Pet.getOneById.mockResolvedValue(mockPet);
    Pet.getNearbySightings.mockResolvedValue(mockSightings);
    getAiMatches.mockResolvedValue(mockAiResult);

    const response = await request(app)
      .get("/pets/1/ai-matches")
      .set("Authorization", "Bearer fake-token");

    expect(response.status).toBe(200);
    expect(response.body.matches).toHaveLength(1);
    expect(response.body.matches[0].likelihood).toBe("High");
    // check sighting data is attached
    expect(response.body.matches[0].sighting).toBeDefined();
    expect(response.body.matches[0].sighting.sightings_id).toBe(1);
    expect(response.body.summary).toBe("Found one possible match nearby");
  });

  it("returns 502 when gemini times out", async () => {
    Pet.getOneById.mockResolvedValue(mockPet);
    Pet.getNearbySightings.mockResolvedValue(mockSightings);
    getAiMatches.mockRejectedValue(new Error("Gemini API timed out"));

    const response = await request(app)
      .get("/pets/1/ai-matches")
      .set("Authorization", "Bearer fake-token");

    expect(response.status).toBe(502);
    expect(response.body.error).toBe(
      "AI service unavailable, please try again",
    );
  });

  it("returns 502 when gemini api errors", async () => {
    Pet.getOneById.mockResolvedValue(mockPet);
    Pet.getNearbySightings.mockResolvedValue(mockSightings);
    getAiMatches.mockRejectedValue(new Error("Gemini API error: 429"));

    const response = await request(app)
      .get("/pets/1/ai-matches")
      .set("Authorization", "Bearer fake-token");

    expect(response.status).toBe(502);
  });

  it("returns 500 when ai response is invalid json", async () => {
    Pet.getOneById.mockResolvedValue(mockPet);
    Pet.getNearbySightings.mockResolvedValue(mockSightings);
    getAiMatches.mockRejectedValue(new SyntaxError("Unexpected token"));

    const response = await request(app)
      .get("/pets/1/ai-matches")
      .set("Authorization", "Bearer fake-token");

    expect(response.status).toBe(500);
    expect(response.body.error).toBe(
      "AI response was invalid, please try again",
    );
  });

  it("returns 400 when pet has no location data", async () => {
    Pet.getOneById.mockResolvedValue({
      ...mockPet,
      lat: undefined,
      lng: undefined,
    });

    const response = await request(app)
      .get("/pets/1/ai-matches")
      .set("Authorization", "Bearer fake-token");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Pet location data is missing");
  });

  it("returns 500 for unexpected errors", async () => {
    Pet.getOneById.mockRejectedValue(new Error("Database connection failed"));

    const response = await request(app)
      .get("/pets/1/ai-matches")
      .set("Authorization", "Bearer fake-token");

    expect(response.status).toBe(500);
  });

  it("calls getNearbySightings with pet coordinates", async () => {
    Pet.getOneById.mockResolvedValue(mockPet);
    Pet.getNearbySightings.mockResolvedValue([]);

    await request(app)
      .get("/pets/1/ai-matches")
      .set("Authorization", "Bearer fake-token");

    expect(Pet.getNearbySightings).toHaveBeenCalledWith(
      mockPet.lat,
      mockPet.lng,
    );
  });

  it("calls getAiMatches with pet and sightings", async () => {
    Pet.getOneById.mockResolvedValue(mockPet);
    Pet.getNearbySightings.mockResolvedValue(mockSightings);
    getAiMatches.mockResolvedValue(mockAiResult);

    await request(app)
      .get("/pets/1/ai-matches")
      .set("Authorization", "Bearer fake-token");

    expect(getAiMatches).toHaveBeenCalledWith(mockPet, mockSightings);
  });
});
