const usersController = require("../../../controller/users")
const User = require("../../../model/User")
const Profile = require("../../../model/Profile")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const mockSend = jest.fn()
const mockJson = jest.fn()
const mockEnd = jest.fn()

const mockStatus = jest.fn(() => ({
  send: mockSend,
  json: mockJson,
  end: mockEnd,
}))

const mockRes = { status: mockStatus }

describe("Users controller", () => {
  beforeEach(() => jest.clearAllMocks())

  afterAll(() => jest.resetAllMocks())

  describe("show", () => {
    let testUser, mockReq

    beforeEach(() => {
      testUser = {
        users_id: 1,
        username: "testuser",
        password: "hashedpassword",
        created_at: new Date()
      }

      mockReq = { params: { username: "testuser" } }
    })

    it("should return a user with a 200 status code", async () => {
      jest.spyOn(User, "getOneByUsername").mockResolvedValue(testUser)

      await usersController.show(mockReq, mockRes)

      expect(User.getOneByUsername).toHaveBeenCalledTimes(1)
      expect(User.getOneByUsername).toHaveBeenCalledWith("testuser")
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockSend).toHaveBeenCalledWith({ data: testUser })
    })

    it("should return an error if the user is not found", async () => {
      jest.spyOn(User, "getOneByUsername").mockRejectedValue(new Error("Unable to locate user."))

      await usersController.show(mockReq, mockRes)

      expect(User.getOneByUsername).toHaveBeenCalledTimes(1)
      expect(mockStatus).toHaveBeenCalledWith(404)
      expect(mockSend).toHaveBeenCalledWith({ error: "Unable to locate user." })
    })
  })

  describe("register", () => {
    it("should return a new user with a 201 status code", async () => {
      const testUser = {
        username: "testuser",
        password: "password123"
      }

      const mockReq = { body: testUser }

      jest.spyOn(User, "create").mockResolvedValue(testUser)
      jest.spyOn(Profile, "createProfile").mockResolvedValue()

      await usersController.register(mockReq, mockRes)

      expect(User.create).toHaveBeenCalledTimes(1)
      expect(mockStatus).toHaveBeenCalledWith(201)
      expect(mockSend).toHaveBeenCalledWith({ data: testUser })
    })

    it("should return an error if registration fails", async () => {
      const testUser = {
        username: "testuser",
        password: "password123"
      }

      const mockReq = { body: testUser }

      jest.spyOn(User, "create").mockRejectedValue(new Error("Missing required fields."))

      await usersController.register(mockReq, mockRes)

      expect(User.create).toHaveBeenCalledTimes(1)
      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockSend).toHaveBeenCalledWith({ error: "Missing required fields." })
    })
  })

  describe("login", () => {
    it("should login a user with a 200 status code", async () => {
      const mockReq = {
        body: {
          username: "testuser",
          password: "password123"
        }
      }

      const testUser = {
        users_id: 1,
        username: "testuser",
        password: "hashedpassword"
      }

      jest.spyOn(User, "getOneByUsername").mockResolvedValue(testUser)
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true)
      jest.spyOn(jwt, "sign").mockImplementation((payload, secret, options, callback) => {
        callback(null, "fake-token")
      })

      await usersController.login(mockReq, mockRes)

      expect(User.getOneByUsername).toHaveBeenCalledTimes(1)
      expect(User.getOneByUsername).toHaveBeenCalledWith("testuser")
      expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashedpassword")
      expect(jwt.sign).toHaveBeenCalledTimes(1)
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        token: "fake-token",
        user: {
          users_id: 1,
          username: "testuser"
        }
      })
    })

    it("should return an error if the user is not found", async () => {
      const mockReq = {
        body: {
          username: "nobody",
          password: "password123"
        }
      }

      jest.spyOn(User, "getOneByUsername").mockRejectedValue(new Error("Unable to locate user."))

      await usersController.login(mockReq, mockRes)

      expect(User.getOneByUsername).toHaveBeenCalledTimes(1)
      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockSend).toHaveBeenCalledWith({ error: "Unable to locate user." })
    })

    it("should return an error if the password is wrong", async () => {
      const mockReq = {
        body: {
          username: "testuser",
          password: "wrongpassword"
        }
      }

      const testUser = {
        users_id: 1,
        username: "testuser",
        password: "hashedpassword"
      }

      jest.spyOn(User, "getOneByUsername").mockResolvedValue(testUser)
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false)

      await usersController.login(mockReq, mockRes)

      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockSend).toHaveBeenCalledWith({ error: "User could not be authenticated" })
    })
  })
})