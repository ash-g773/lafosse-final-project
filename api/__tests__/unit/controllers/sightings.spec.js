const sightingsController = require('../../../controller/sightings')
const Sighting = require('../../../model/Sighting')

// Mocking response methods
const mockSend = jest.fn()
const mockJson = jest.fn()
const mockEnd = jest.fn()

// we are mocking .send(), .json() and .end()
const mockStatus = jest.fn(() => ({
  send: mockSend,
  json: mockJson,
  end: mockEnd
}));

const mockRes = { status: mockStatus };

jest.mock('../../../model/Alert', () => ({
  createForAllUsers: jest.fn().mockResolvedValue(undefined)
}))

jest.mock('../../../utils/cloudinary.utils', () =>
  jest.fn().mockResolvedValue('http://cloudinary.com/image.jpg')
)

describe('Sightings controller', () => {
  beforeEach(() => jest.clearAllMocks())

  afterAll(() => jest.resetAllMocks())

  describe('create', () => {
    it('should return a new sighting with a 201 status code', async () => {
      const testSighting = {
        pets_id: 1,
        users_id: 1,
        guest_contact: 'guest@example.com',
        sighting_description: 'Saw a fluffy white cat near the park',
        location_description: 'Hyde Park entrance',
        lat: 51.5,
        lng: -0.1,
        image_url: null
      }
      const mockReq = { body: testSighting }

      jest.spyOn(Sighting, 'create').mockResolvedValue(
        new Sighting({ ...testSighting, sightings_id: 1, created_at: new Date() })
      )

      await sightingsController.create(mockReq, mockRes)

      expect(Sighting.create).toHaveBeenCalledTimes(1)
      expect(mockStatus).toHaveBeenCalledWith(201)
      expect(mockJson).toHaveBeenCalledWith(expect.any(Sighting))
    })

    it('should upload image to cloudinary when req.file exists', async () => {
      const testSighting = {
        pets_id: 1,
        users_id: 1,
        sighting_description: 'Saw a cat',
        lat: 51.5,
        lng: -0.1,
        image_url: null
      }
      const mockReq = {
        body: testSighting,
        file: { buffer: Buffer.from('fake image') }
      }

      jest.spyOn(Sighting, 'create').mockResolvedValue(
        new Sighting({ ...testSighting, sightings_id: 1, image_url: 'http://cloudinary.com/image.jpg', created_at: new Date() })
      )

      await sightingsController.create(mockReq, mockRes)

      expect(mockStatus).toHaveBeenCalledWith(201)
      expect(mockJson).toHaveBeenCalledWith(expect.any(Sighting))
    })

    it('should return an error if creation fails', async () => {
      const mockReq = { body: { pets_id: 1 } }

      jest.spyOn(Sighting, 'create').mockRejectedValue(new Error('oh no'))

      await sightingsController.create(mockReq, mockRes)

      expect(Sighting.create).toHaveBeenCalledTimes(1)
      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({ error: 'oh no' })
    })
  })

  describe('index', () => {
    it('should return a list of sightings with a 200 status code', async () => {
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
        }
      ]
      jest.spyOn(Sighting, 'getAll').mockResolvedValue(testSightings)

      await sightingsController.index({}, mockRes)

      expect(Sighting.getAll).toHaveBeenCalledTimes(1)
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith(testSightings)
    })

    it('should return a 500 if fetching sightings fails', async () => {
      jest.spyOn(Sighting, 'getAll').mockRejectedValue(new Error('Database error'))

      await sightingsController.index({}, mockRes)

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({ error: 'Database error' })
    })
  })
  describe('show', () => {
    it('should return a sighting with a 200 status code', async () => {
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
      const mockReq = { params: { id: '1' } }

      jest.spyOn(Sighting, 'getOneById').mockResolvedValue(testSighting)

      await sightingsController.show(mockReq, mockRes)

      expect(Sighting.getOneById).toHaveBeenCalledWith(1)
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith(testSighting)
    })

    it('should return a 404 if sighting is not found', async () => {
      const mockReq = { params: { id: '999' } }

      jest.spyOn(Sighting, 'getOneById').mockRejectedValue(new Error('Sighting not found.'))

      await sightingsController.show(mockReq, mockRes)

      expect(mockStatus).toHaveBeenCalledWith(404)
      expect(mockJson).toHaveBeenCalledWith({ error: 'Sighting not found.' })
    })
  })
})