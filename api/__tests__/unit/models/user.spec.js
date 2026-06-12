const User = require("../../../model/User")
const db = require("../../../database/connect")

describe("User", () => {
  beforeEach(() => jest.clearAllMocks())

  afterAll(() => jest.resetAllMocks())

  describe("getOneById", () => {
    it("should return a user when given a valid id", async () => {
      // Arrange
      const testUser = {
        users_id: 1,
        username: "testuser",
        password: "hashedpassword",
        created_at: new Date()
      }
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [testUser] })

      // Act
      const result = await User.getOneById(1)

      // Assert
      expect(result).toBeInstanceOf(User)
      expect(result.users_id).toBe(testUser.users_id)
      expect(result.username).toBe(testUser.username)
      expect(result.password).toBe(testUser.password)
      expect(db.query).toHaveBeenCalledWith("SELECT * FROM users WHERE users_id = $1;", [1])
    })

    it("should throw an error when given an invalid id", async () => {
      // Arrange
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] })

      await expect(User.getOneById(999)).rejects.toThrow("Unable to locate user.")
    })
  })

  describe("getOneByUsername", () => {
    it("should return a user when given a valid username", async () => {
      // Arrange
      const testUser = {
        users_id: 1,
        username: "testuser",
        password: "hashedpassword",
        created_at: new Date()
      }
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [testUser] })

      // Act
      const result = await User.getOneByUsername("testuser")

      // Assert
      expect(result).toBeInstanceOf(User)
      expect(result.users_id).toBe(testUser.users_id)
      expect(result.username).toBe(testUser.username)
      expect(result.password).toBe(testUser.password)
      expect(db.query).toHaveBeenCalledWith("SELECT * FROM users WHERE username = $1;", ["testuser"])
    })

    it("should throw an error when given an invalid username", async () => {
      // Arrange
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] })

      await expect(User.getOneByUsername("nobody")).rejects.toThrow("Unable to locate user.")
    })
  })

  describe("create", () => {
    it("resolves with a new user on successful creation", async () => {
      // Arrange
      const newUserData = { username: "newuser", password: "hashedpassword" }
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [{ ...newUserData, users_id: 1, created_at: new Date() }] })
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [{ ...newUserData, users_id: 1, created_at: new Date() }] })

      // Act
      const result = await User.create(newUserData)

      // Assert
      expect(result).toBeInstanceOf(User)
      expect(result).toHaveProperty("users_id", 1)
      expect(result).toHaveProperty("username", "newuser")
      expect(result).toHaveProperty("password", "hashedpassword")
      expect(db.query).toHaveBeenCalledWith("INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *;", [newUserData.username, newUserData.password])
    })

    it("should throw an error when username is missing", async () => {
      const incompleteData = { password: "password123" }

      await expect(User.create(incompleteData)).rejects.toThrow("Missing required fields.")
    })

    it("should throw an error when password is missing", async () => {
      const incompleteData = { username: "testuser" }

      await expect(User.create(incompleteData)).rejects.toThrow("Missing required fields.")
    })
  })
})