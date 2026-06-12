const petsController = require('../../../controller/pets')
const Pet = require('../../../model/Pet')
 
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
 
 
describe('Pets controller', () => {
  beforeEach(() => jest.clearAllMocks())
 
  afterAll(() => jest.resetAllMocks())
 
  describe('index', () => {
    it('should return pets with a status code 200', async () => {
      const testPets = ['p1', 'p2']
      jest.spyOn(Pet, 'getAll').mockResolvedValue(testPets)
 
      await petsController.index(null, mockRes)
 
      expect(Pet.getAll).toHaveBeenCalledTimes(1)
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith(testPets)
    })
 
    it('should return an error upon failure', async () => {
      jest.spyOn(Pet, 'getAll').mockRejectedValue(new Error('Something happened to your db'))
 
      await petsController.index(null, mockRes)
 
      expect(Pet.getAll).toHaveBeenCalledTimes(1)
      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({ error: 'Something happened to your db' })
    })
  })
 
  describe('show', () => {
    let testPet, mockReq;
 
    beforeEach(() => {
      testPet = {
        pets_id: 1,
        users_id: 1,
        name: 'Fluffy',
        species: 'cat',
        breed: 'Persian',
        colour: 'white',
        description: 'fluffy white cat',
        last_seen_location: 'London',
        lat: 51.5,
        lng: -0.1,
        image_url: 'http://example.com/fluffy.jpg',
        status: 'lost',
        created_at: new Date()
      }
      mockReq = { params: { id: 1 } }
    });
 
    it('should return a pet with a 200 status code', async () => {
      jest.spyOn(Pet, 'getOneById').mockResolvedValue(new Pet(testPet))
 
      await petsController.show(mockReq, mockRes);
 
      expect(Pet.getOneById).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(new Pet(testPet))
    })
 
    it('should return an error if the pet is not found', async () => {
      jest.spyOn(Pet, 'getOneById').mockRejectedValue(new Error('Pet not found.'))
 
      await petsController.show(mockReq, mockRes)
 
      expect(Pet.getOneById).toHaveBeenCalledTimes(1)
      expect(mockStatus).toHaveBeenCalledWith(404)
      expect(mockJson).toHaveBeenCalledWith({ error: 'Pet not found.' })
    })
  })
 
  describe('create', () => {
    it('should return a new pet with a 201 status code', async () => {
      const testPet = {
        users_id: 1,
        name: 'Fluffy',
        species: 'cat',
        breed: 'Persian',
        colour: 'white',
        description: 'fluffy white cat',
        last_seen_location: 'London',
        lat: 51.5,
        lng: -0.1,
        image_url: 'http://example.com/fluffy.jpg'
      }
      const mockReq = { body: testPet }
 
      jest.spyOn(Pet, 'create').mockResolvedValue(new Pet({ ...testPet, pets_id: 1, status: 'lost', created_at: new Date() }))
 
      await petsController.create(mockReq, mockRes)
 
      expect(Pet.create).toHaveBeenCalledTimes(1)
      expect(mockStatus).toHaveBeenCalledWith(201)
      expect(mockJson).toHaveBeenCalledWith(expect.any(Pet))
    })
 
    it('should return an error if creation fails', async () => {
      const mockReq = { body: { name: 'Fluffy' } }
 
      jest.spyOn(Pet, 'create').mockRejectedValue(new Error('oh no'))
 
      await petsController.create(mockReq, mockRes)
 
      expect(Pet.create).toHaveBeenCalledTimes(1)
      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({ error: 'oh no' })
    })
  })
})