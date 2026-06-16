const request = require('supertest')
const app = require('../../app')
const { resetTestDB } = require('./config')

describe('Pets API Endpoints', () => {
  let api

  beforeEach(async () => {
    await resetTestDB()
  })

  beforeAll(() => {
    api = app.listen(4000, () => {
      console.log('Test server running on port 4000')
    })
  })

  afterAll((done) => {
    console.log('Gracefully closing server')
    api.close(done)
  })

  describe('GET /pets', () => {
    it('should return all pets with a status code 200', async () => {
      const response = await request(api).get('/pets')

      expect(response.statusCode).toBe(200)
      expect(response.body).toBeInstanceOf(Array)
      expect(response.body.length).toBeGreaterThan(0)
    })
  })

  describe('GET /pets/:id', () => {
    it('should return a specific pet by ID', async () => {
      const response = await request(api).get('/pets/1')

      expect(response.statusCode).toBe(200)
      expect(response.body).toHaveProperty('pets_id', 1)
      expect(response.body).toHaveProperty('name', 'Fluffy')
    })

    it('should return 404 if pet is not found', async () => {
      const response = await request(api).get('/pets/999')

      expect(response.statusCode).toBe(404)
    })
  })


  describe('POST /sightings', () => {
  it('should create a new sighting and return 201', async () => {
    const newSighting = {
      pets_id: 1,
      users_id: 2,
      sighting_description: 'Saw a white cat near the park',
      location_description: 'Hyde Park',
      lat: 51.5074,
      lng: -0.1278,
      image_url: null
    }
    const response = await request(api)
      .post('/sightings')
      .send(newSighting)

    expect(response.statusCode).toBe(201)
    expect(response.body).toHaveProperty('sightings_id')
    expect(response.body).toHaveProperty('sighting_description', 'Saw a white cat near the park')
  })

  it('should return 400 if required fields are missing', async () => {
    const incompleteSighting = { pets_id: 1 }
    const response = await request(api)
      .post('/sightings')
      .send(incompleteSighting)

    expect(response.statusCode).toBe(400)
  })
})


describe('GET /users/:username', () => {
  it('should return a user with a 200 status code', async () => {
    const response = await request(api).get('/users/testuser1')

    expect(response.statusCode).toBe(200)
    expect(response.body.data).toHaveProperty('username', 'testuser1')
  })

  it('should return 404 if user is not found', async () => {
    const response = await request(api).get('/users/nobody')

    expect(response.statusCode).toBe(404)
  })
})


describe('POST /users/login', () => {
  it('should login and return a token', async () => {
    const response = await request(api)
      .post('/users/login')
      .send({ username: 'testuser1', password: 'password123' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('token')
    expect(response.body.user).toHaveProperty('username', 'testuser1')
  })

  it('should return 401 if password is wrong', async () => {
    const response = await request(api)
      .post('/users/login')
      .send({ username: 'testuser1', password: 'wrongpassword' })

    expect(response.statusCode).toBe(401)
  })
})
})