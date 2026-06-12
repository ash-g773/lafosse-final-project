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
        image_url: 'http://example.com/sighting.jpg'
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
 
    it('should return an error if creation fails', async () => {
      const mockReq = { body: { pets_id: 1 } }
 
      jest.spyOn(Sighting, 'create').mockRejectedValue(new Error('oh no'))
 
      await sightingsController.create(mockReq, mockRes)
 
      expect(Sighting.create).toHaveBeenCalledTimes(1)
      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({ error: 'oh no' })
    })
  })
})