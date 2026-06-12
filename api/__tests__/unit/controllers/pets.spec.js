const petController = require('../../../controller/pets');
const Pet = require('../../../model/Pet');
 
const mockSend = jest.fn();
const mockJson = jest.fn();
const mockEnd = jest.fn();
 
const mockStatus = jest.fn(() => ({
  send: mockSend,
  json: mockJson,
  end: mockEnd,
}));
 
const mockRes = { status: mockStatus };
 
describe('Pets controller', () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.resetAllMocks());
 
  describe('index', () => {
    it('should return a list of pets with a 200 status code', async () => {
      const testPets = [
        { pets_id: 1, name: 'Fluffy', type: 'cat', age: 3 },
        { pets_id: 2, name: 'Rover', type: 'dog', age: 5 },
      ];
      jest.spyOn(Pet, 'getAll').mockResolvedValue(testPets);
 
      await petController.index({}, mockRes);
 
      expect(Pet.getAll).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(testPets);
    });
 
    it('should return an error if there is a problem retrieving pets', async () => {
      jest.spyOn(Pet, 'getAll').mockRejectedValue(new Error('Unable to retrieve pets.'));
 
      await petController.index({}, mockRes);
 
      expect(Pet.getAll).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Unable to retrieve pets.' });
    });
  });
 
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
 
      await petController.show(mockReq, mockRes);
 
      expect(Pet.getOneById).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(new Pet(testPet))
    })
 
    it('should return an error if the pet is not found', async () => {
      jest.spyOn(Pet, 'getOneById').mockRejectedValue(new Error('Pet not found.'))
 
      await petController.show(mockReq, mockRes)
 
      expect(Pet.getOneById).toHaveBeenCalledTimes(1)
      expect(mockStatus).toHaveBeenCalledWith(404)
      expect(mockJson).toHaveBeenCalledWith({ error: 'Pet not found.' })
    })
  });
 
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
 
      await petController.create(mockReq, mockRes)
 
      expect(Pet.create).toHaveBeenCalledTimes(1)
      expect(mockStatus).toHaveBeenCalledWith(201)
      expect(mockJson).toHaveBeenCalledWith(expect.any(Pet))
    })
 
    it('should return an error if creation fails', async () => {
      const mockReq = { body: { name: 'Fluffy' } }
 
      jest.spyOn(Pet, 'create').mockRejectedValue(new Error('oh no'))
 
      await petController.create(mockReq, mockRes)
 
      expect(Pet.create).toHaveBeenCalledTimes(1)
      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({ error: 'oh no' })
    })
  });
});





