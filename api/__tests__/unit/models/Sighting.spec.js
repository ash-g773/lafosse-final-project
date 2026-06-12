const Sighting = require('../../../model/Sighting')
const db = require('../../../database/connect')

describe('Sighting', () => {
  beforeEach(() => jest.clearAllMocks())

  afterAll(() => jest.resetAllMocks())

  describe('getAll', () => {
    it('should return a list of sightings', async () => {
      const testSightings = [
        {
          sightings_id: 1,
          pets_id: 1,
          users_id: 1,
          guest_contact: null,
          sighting_description: 'Saw a black cat near the park',
          location_description: 'Hyde Park entrance',
          lat: 51.5074,
          lng: -0.1278,
          image_url: null,
          created_at: new Date()
        },
        {
          sightings_id: 2,
          pets_id: null,
          users_id: null,
          guest_contact: '07700000000',
          sighting_description: 'Found a dog wandering alone',
          location_description: 'Victoria Park',
          lat: 51.5362,
          lng: 0.0373,
          image_url: null,
          created_at: new Date()
        }
      ]
      jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: testSightings })

      const result = await Sighting.getAll()

      expect(result).toHaveLength(2)
      expect(result[0]).toBeInstanceOf(Sighting)
      expect(result[1]).toBeInstanceOf(Sighting)
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM sightings ORDER BY created_at DESC;')
    })

    it('should return an empty array if there are no sightings', async () => {
      jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: [] })

      const result = await Sighting.getAll()

      expect(result).toHaveLength(0)
      expect(result).toEqual([])
    })
  })

  describe('getOneById', () => {
    it('should return a sighting when given a valid id', async () => {
      const testSighting = {
        sightings_id: 1,
        pets_id: 1,
        users_id: 1,
        guest_contact: null,
        sighting_description: 'Saw a black cat near the park',
        location_description: 'Hyde Park entrance',
        lat: 51.5074,
        lng: -0.1278,
        image_url: null,
        created_at: new Date()
      }
      jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: [testSighting] })

      const result = await Sighting.getOneById(1)

      expect(result).toBeInstanceOf(Sighting)
      expect(result).toHaveProperty('sightings_id', 1)
      expect(result).toHaveProperty('sighting_description', 'Saw a black cat near the park')
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM sightings WHERE sightings_id = $1;', [1])
    })

    it('should throw an error when sighting is not found', async () => {
      jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: [] })

      await expect(Sighting.getOneById(999)).rejects.toThrow('Sighting not found.')
    })
  })

  describe('create', () => {
    it('resolves with a sighting on successful creation', async () => {
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

      const result = await Sighting.create(sightingData)

      expect(result).toBeInstanceOf(Sighting)
      expect(result).toHaveProperty('sightings_id', 1)
      expect(result).toHaveProperty('pets_id', 1)
      expect(result).toHaveProperty('sighting_description', 'Saw a fluffy white cat near the park')
      expect(db.query).toHaveBeenCalledWith(
        `INSERT INTO sightings (pets_id, users_id, guest_contact, sighting_description, location_description, lat, lng, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`,
        [sightingData.pets_id, sightingData.users_id, sightingData.guest_contact, sightingData.sighting_description, sightingData.location_description, sightingData.lat, sightingData.lng, sightingData.image_url]
      )
    })

    it('should throw an Error on db query failure', async () => {
      const sightingData = {
        pets_id: 1, users_id: 1, guest_contact: 'guest@example.com',
        sighting_description: 'Saw a cat', location_description: 'Hyde Park',
        lat: 51.5, lng: -0.1, image_url: 'http://example.com/sighting.jpg'
      }
      jest.spyOn(db, 'query').mockRejectedValue(new Error('Database error'))

      await expect(Sighting.create(sightingData)).rejects.toThrow('Database error')
    })
  })
})