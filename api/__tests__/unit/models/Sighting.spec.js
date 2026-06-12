const Sighting = require('../../../model/Sighting')
const db = require('../../../database/connect')
 
describe('Sighting', () => {
  beforeEach(() => jest.clearAllMocks())
 
  afterAll(() => jest.resetAllMocks())
 
  describe('create', () => {
    it('resolves with a sighting on successful creation', async () => {
      // Arrange
      const sightingData = {
        pets_id: 1,
        users_id: 1,
        guest_contact: 'guest@example.com',
        sighting_description: 'Saw a fluffy white cat near the park',
        location_description: 'Hyde Park entrance',
        lat: 51.5,
        lng: -0.1,
        image_url: 'http://example.com/sighting.jpg'
      }
      const dbResponse = { ...sightingData, sightings_id: 1, created_at: new Date() }
      jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: [dbResponse] })
 
      // Act
      const result = await Sighting.create(sightingData)
 
      // Assert
      expect(result).toBeInstanceOf(Sighting)
      expect(result).toHaveProperty('sightings_id', 1)
      expect(result).toHaveProperty('pets_id', 1)
      expect(result).toHaveProperty('sighting_description', 'Saw a fluffy white cat near the park')
      expect(db.query).toHaveBeenCalledWith(
        `INSERT INTO sightings (pets_id, users_id, guest_contact, sighting_description, location_description, lat, lng, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *;`,
        [sightingData.pets_id, sightingData.users_id, sightingData.guest_contact, sightingData.sighting_description, sightingData.location_description, sightingData.lat, sightingData.lng, sightingData.image_url]
      )
    })
 
    it('should throw an Error on db query failure', async () => {
      // Arrange
      const sightingData = {
        pets_id: 1, users_id: 1, guest_contact: 'guest@example.com',
        sighting_description: 'Saw a cat', location_description: 'Hyde Park',
        lat: 51.5, lng: -0.1, image_url: 'http://example.com/sighting.jpg'
      }
      jest.spyOn(db, 'query').mockRejectedValue(new Error('Database error'))
 
      // Act & Assert
      await expect(Sighting.create(sightingData)).rejects.toThrow('Database error')
    })
  })
})