const profileController = require('../../../controller/profile')
const Profile = require('../../../model/Profile')

const mockSend = jest.fn()
const mockJson = jest.fn()
const mockEnd = jest.fn()

const mockStatus = jest.fn(() => ({
  send: mockSend,
  json: mockJson,
  end: mockEnd
}))

const mockRes = { status: mockStatus }

describe('Profile controller', () => {
  beforeEach(() => jest.clearAllMocks())

  afterAll(() => jest.resetAllMocks())

  describe('getProfile', () => {
    it('should return a profile with a 200 status code', async () => {
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
      const mockReq = { params: { users_id: '1' } }

      jest.spyOn(Profile, 'getProfileByUserId').mockResolvedValue(testProfile)

      await profileController.getProfile(mockReq, mockRes)

      expect(Profile.getProfileByUserId).toHaveBeenCalledWith(1)
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({ data: testProfile })
    })

    it('should return a 404 if profile is not found', async () => {
      const mockReq = { params: { users_id: '999' } }

      jest.spyOn(Profile, 'getProfileByUserId').mockRejectedValue(new Error('Profile not found.'))

      await profileController.getProfile(mockReq, mockRes)

      expect(mockStatus).toHaveBeenCalledWith(404)
      expect(mockJson).toHaveBeenCalledWith({ error: 'Profile not found.' })
    })
  })

  describe('updateProfile', () => {
    it('should return the updated profile with a 200 status code', async () => {
      const updatedProfile = {
        profiles_id: 1,
        users_id: 1,
        full_name: 'Updated Name',
        phone: '07711111111',
        postcode: 'SS2 2BB',
        lat: 51.5,
        lng: 0.7,
        alert_radius: 3000,
        created_at: new Date()
      }
      const mockReq = {
        params: { users_id: '1' },
        body: {
          full_name: 'Updated Name',
          phone: '07711111111',
          postcode: 'SS2 2BB',
          lat: 51.5,
          lng: 0.7,
          alert_radius: 3000
        }
      }

      jest.spyOn(Profile, 'updateProfile').mockResolvedValue(updatedProfile)

      await profileController.updateProfile(mockReq, mockRes)

      expect(Profile.updateProfile).toHaveBeenCalledWith(1, mockReq.body)
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({ data: updatedProfile })
    })

    it('should return a 400 if update fails', async () => {
      const mockReq = {
        params: { users_id: '1' },
        body: {}
      }

      jest.spyOn(Profile, 'updateProfile').mockRejectedValue(new Error('Unable to update profile.'))

      await profileController.updateProfile(mockReq, mockRes)

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({ error: 'Unable to update profile.' })
    })
  })

  describe('getUserPets', () => {
    it('should return a list of pets with a 200 status code', async () => {
      const testPets = [
        {
          pets_id: 1,
          users_id: 1,
          name: 'Metro',
          species: 'cat',
          status: 'lost'
        }
      ]
      const mockReq = { params: { users_id: '1' } }

      jest.spyOn(Profile, 'getPetsByUserId').mockResolvedValue(testPets)

      await profileController.getUserPets(mockReq, mockRes)

      expect(Profile.getPetsByUserId).toHaveBeenCalledWith(1)
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({ data: testPets })
    })

    it('should return a 404 if fetching pets fails', async () => {
      const mockReq = { params: { users_id: '999' } }

      jest.spyOn(Profile, 'getPetsByUserId').mockRejectedValue(new Error('No pets found.'))

      await profileController.getUserPets(mockReq, mockRes)

      expect(mockStatus).toHaveBeenCalledWith(404)
      expect(mockJson).toHaveBeenCalledWith({ error: 'No pets found.' })
    })
  })

  describe('getUserSightings', () => {
    it('should return a list of sightings with a 200 status code', async () => {
      const testSightings = [
        {
          sightings_id: 1,
          users_id: 1,
          sighting_description: 'Saw a black cat near the park',
          lat: 51.5074,
          lng: -0.1278
        }
      ]
      const mockReq = { params: { users_id: '1' } }

      jest.spyOn(Profile, 'getSightingsByUserId').mockResolvedValue(testSightings)

      await profileController.getUserSightings(mockReq, mockRes)

      expect(Profile.getSightingsByUserId).toHaveBeenCalledWith(1)
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({ data: testSightings })
    })

    it('should return a 404 if fetching sightings fails', async () => {
      const mockReq = { params: { users_id: '999' } }

      jest.spyOn(Profile, 'getSightingsByUserId').mockRejectedValue(new Error('No sightings found.'))

      await profileController.getUserSightings(mockReq, mockRes)

      expect(mockStatus).toHaveBeenCalledWith(404)
      expect(mockJson).toHaveBeenCalledWith({ error: 'No sightings found.' })
    })
  })
})