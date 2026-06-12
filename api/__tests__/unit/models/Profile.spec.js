const Profile = require('../../../model/Profile')
const db = require('../../../database/connect')

describe('Profile', () => {
    beforeEach(() => jest.clearAllMocks())

    afterAll(() => jest.resetAllMocks())

    describe('createProfile', () => {
        it('should resolve with a new profile on successful creation', async () => {
            const dbResponse = {
                profiles_id: 1,
                users_id: 1,
                full_name: null,
                phone: null,
                postcode: null,
                lat: null,
                lng: null,
                alert_radius: 5000,
                created_at: new Date()
            }
            jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: [dbResponse] })

            const result = await Profile.createProfile(1)

            expect(result).toBeInstanceOf(Profile)
            expect(result).toHaveProperty('profiles_id', 1)
            expect(result).toHaveProperty('users_id', 1)
            expect(result).toHaveProperty('full_name', null)
            expect(db.query).toHaveBeenCalledWith(
                'INSERT INTO profiles (users_id) VALUES ($1) RETURNING *;',
                [1]
            )
        })

        it('should throw an error on db query failure', async () => {
            jest.spyOn(db, 'query').mockRejectedValue(new Error('Database error'))

            await expect(Profile.createProfile(1)).rejects.toThrow('Database error')
        })
    })

    describe('getProfileByUserId', () => {
        it('should return a profile when given a valid users_id', async () => {
            const testProfile = {
                profiles_id: 1,
                users_id: 1,
                full_name: 'Test User',
                phone: '07700000000',
                postcode: 'SS1 1AA',
                lat: 51.537,
                lng: 0.713,
                alert_radius: 5000,
                created_at: new Date()
            }
            jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: [testProfile] })

            const result = await Profile.getProfileByUserId(1)

            expect(result).toBeInstanceOf(Profile)
            expect(result).toHaveProperty('profiles_id', 1)
            expect(result).toHaveProperty('users_id', 1)
            expect(result).toHaveProperty('full_name', 'Test User')
            expect(result).toHaveProperty('postcode', 'SS1 1AA')
            expect(db.query).toHaveBeenCalledWith(
                'SELECT * FROM profiles WHERE users_id = $1;',
                [1]
            )
        })

        it('should throw an error when profile is not found', async () => {
            jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: [] })

            await expect(Profile.getProfileByUserId(999)).rejects.toThrow('Profile not found.')
        })
    })

    describe('getPetsByUserId', () => {
        it('should return a list of pets for a user', async () => {
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
                }
            ]
            jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: testPets })

            const result = await Profile.getPetsByUserId(1)

            expect(result).toHaveLength(1)
            expect(result[0]).toHaveProperty('name', 'Metro')
            expect(db.query).toHaveBeenCalledWith(
                'SELECT * FROM pets WHERE users_id = $1 ORDER BY created_at DESC;',
                [1]
            )
        })

        it('should return an empty array if the user has no pets', async () => {
            jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: [] })

            const result = await Profile.getPetsByUserId(1)

            expect(result).toHaveLength(0)
            expect(result).toEqual([])
        })
    })

    describe('getSightingsByUserId', () => {
        it('should return a list of sightings for a user', async () => {
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
            jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: testSightings })

            const result = await Profile.getSightingsByUserId(1)

            expect(result).toHaveLength(1)
            expect(result[0]).toHaveProperty('sighting_description', 'Saw a black cat near the park')
            expect(db.query).toHaveBeenCalledWith(
                'SELECT * FROM sightings WHERE users_id = $1 ORDER BY created_at DESC;',
                [1]
            )
        })

        it('should return an empty array if the user has no sightings', async () => {
            jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: [] })

            const result = await Profile.getSightingsByUserId(1)

            expect(result).toHaveLength(0)
            expect(result).toEqual([])
        })
    })
})