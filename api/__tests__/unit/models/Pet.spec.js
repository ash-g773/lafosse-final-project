const Pet = require('../../../model/Pet')
const db = require('../../../database/connect')

describe('Pet', () => {
  beforeEach(() => jest.clearAllMocks())

  afterAll(() => jest.resetAllMocks())

  describe('getAll', () => {
    it('should return a list of pets', async () => {
      const testPets = [
        {
          pets_id: 1,
          users_id: 1,
          name: 'Metro',
          species: 'cat',
          breed: 'Domestic Shorthair',
          colour: 'black',
          description: 'lean, mean killing machine',
          last_seen_location: 'London',
          lat: 51.5074,
          lng: -0.1278,
          image_url: null,
          status: 'lost',
          created_at: new Date()
        },
        {
          pets_id: 2,
          users_id: 1,
          name: 'Rover',
          species: 'dog',
          breed: 'Labrador',
          colour: 'yellow',
          description: 'friendly dog',
          last_seen_location: 'Victoria Park',
          lat: 51.5362,
          lng: 0.0373,
          image_url: null,
          status: 'lost',
          created_at: new Date()
        }
      ]
      jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: testPets })

      const result = await Pet.getAll()

      expect(result).toHaveLength(2)
      expect(result[0]).toBeInstanceOf(Pet)
      expect(result[1]).toBeInstanceOf(Pet)
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM pets ORDER BY created_at DESC;')
    })

    it('should throw an error if no pets are found', async () => {
      jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: [] })

      await expect(Pet.getAll()).rejects.toThrow('No pets available.')
    })
  })

  describe('getOneById', () => {
    it('should return a pet when given a valid id', async () => {
      const testPet = {
        pets_id: 1,
        users_id: 1,
        name: 'Metro',
        species: 'cat',
        breed: 'Domestic Shorthair',
        colour: 'black',
        description: 'lean, mean killing machine',
        last_seen_location: 'London',
        lat: 51.5074,
        lng: -0.1278,
        image_url: null,
        status: 'lost',
        created_at: new Date()
      }
      jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: [testPet] })

      const result = await Pet.getOneById(1)

      expect(result).toBeInstanceOf(Pet)
      expect(result).toHaveProperty('pets_id', 1)
      expect(result).toHaveProperty('name', 'Metro')
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM pets WHERE pets_id = $1;', [1])
    })

    it('should throw an error when pet is not found', async () => {
      jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: [] })

      await expect(Pet.getOneById(999)).rejects.toThrow('Pet not found.')
    })
  })

  describe('create', () => {
    it('should resolve with a new pet on successful creation', async () => {
      const newPetData = {
        users_id: 1,
        name: 'Metro',
        species: 'cat',
        breed: 'Domestic Shorthair',
        colour: 'black',
        description: 'lean, mean killing machine',
        last_seen_location: 'London',
        lat: 51.5074,
        lng: -0.1278,
        image_url: null
      }
      const dbResponse = { ...newPetData, pets_id: 1, status: 'lost', created_at: new Date() }
      jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: [dbResponse] })

      const result = await Pet.create(newPetData)

      expect(result).toBeInstanceOf(Pet)
      expect(result).toHaveProperty('pets_id', 1)
      expect(result).toHaveProperty('name', 'Metro')
      expect(result).toHaveProperty('status', 'lost')
      expect(db.query).toHaveBeenCalledWith(
        `INSERT INTO pets (users_id, name, species, breed, colour, description, last_seen_location, lat, lng, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;`,
        [
          newPetData.users_id,
          newPetData.name,
          newPetData.species,
          newPetData.breed,
          newPetData.colour,
          newPetData.description,
          newPetData.last_seen_location,
          newPetData.lat,
          newPetData.lng,
          newPetData.image_url
        ]
      )
    })

    it('should throw an error on db query failure', async () => {
      jest.spyOn(db, 'query').mockRejectedValue(new Error('Database error'))

      await expect(Pet.create({
        users_id: 1,
        name: 'Metro',
        species: 'cat',
        breed: 'Domestic Shorthair',
        colour: 'black',
        description: 'lean, mean killing machine',
        last_seen_location: 'London',
        lat: 51.5074,
        lng: -0.1278,
        image_url: null
      })).rejects.toThrow('Database error')
    })
  })
})


describe('update', () => {
  it('should return the updated pet on successful update', async () => {
    // Arrange
    const pet = new Pet({ pets_id: 1, users_id: 1, name: 'Fluffy', species: 'cat', breed: 'Persian', colour: 'white', 
        description: 'fluffy cat', last_seen_location: 'London', lat: 51.5, lng: -0.1, image_url: 'http://example.com/1.jpg', status: 'lost', created_at: new Date() })
    const updatedData = { status: 'reunited' }
    const updatedPet = { ...pet, status: 'reunited' }
    jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: [updatedPet] })

    // Act
    const result = await pet.update(updatedData)

    // Assert
    expect(result).toBeInstanceOf(Pet)
    expect(result.pets_id).toBe(1)
    expect(result.status).toBe('reunited')
    expect(db.query).toHaveBeenCalledWith(
      "UPDATE pets SET status = $1 WHERE pets_id = $2 RETURNING *;",
      [updatedData.status, pet.pets_id]
    )
  })

  it('should throw an Error when the update fails', async () => {
    // Arrange
    const pet = new Pet({ pets_id: 1, users_id: 1, name: 'Fluffy', species: 'cat', breed: 'Persian', colour: 'white', description: 'fluffy cat', last_seen_location: 'London', lat: 51.5, lng: -0.1, image_url: 'http://example.com/1.jpg', status: 'lost', created_at: new Date() })
    jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: [] })

    // Act & Assert
    await expect(pet.update({ status: 'reunited' })).rejects.toThrow('Unable to update pet status.')
  })

  it('should throw an Error on db query failure', async () => {
    // Arrange
    const pet = new Pet({ pets_id: 1, users_id: 1, name: 'Fluffy', species: 'cat', breed: 'Persian', colour: 'white', description: 'fluffy cat', last_seen_location: 'London', lat: 51.5, lng: -0.1, image_url: 'http://example.com/1.jpg', status: 'lost', created_at: new Date() })
    jest.spyOn(db, 'query').mockRejectedValue(new Error('Database error'))

    // Act & Assert
    await expect(pet.update({ status: 'reunited' })).rejects.toThrow('Database error')
  })
})

