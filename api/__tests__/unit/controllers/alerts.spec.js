const alertsController = require('../../../controller/alerts')
const Alert = require('../../../model/Alert')
 
// Mocking response methods
const mockSend = jest.fn()
const mockJson = jest.fn()
const mockEnd = jest.fn()
 
const mockStatus = jest.fn(() => ({
  send: mockSend,
  json: mockJson,
  end: mockEnd
}))
 
const mockRes = { status: mockStatus }
 
describe('Alerts controller', () => {
  beforeEach(() => jest.clearAllMocks())
  afterAll(() => jest.resetAllMocks())
 
  describe('getAlerts', () => {
    it('should return alerts for a user with a 200 status code', async () => {
      // Arrange
      const testAlerts = [
        { alerts_id: 1, users_id: 1, pets_id: 1, alert_type: 'sighting', alert_message: 'Your pet was spotted!', alert_radius: 5, is_read: false, created_at: new Date() },
        { alerts_id: 2, users_id: 1, pets_id: 2, alert_type: 'sighting', alert_message: 'Your pet was spotted again!', alert_radius: 5, is_read: false, created_at: new Date() },
      ]
      const mockReq = { params: { users_id: 1 } }
      jest.spyOn(Alert, 'getByUserId').mockResolvedValue(testAlerts)
 
      // Act
      await alertsController.getAlerts(mockReq, mockRes)
 
      // Assert
      expect(Alert.getByUserId).toHaveBeenCalledWith(1)
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({ data: testAlerts })
    })
 
    it('should return an error upon failure', async () => {
      // Arrange
      const mockReq = { params: { users_id: 1 } }
      jest.spyOn(Alert, 'getByUserId').mockRejectedValue(new Error('Something happened to your db'))
 
      // Act
      await alertsController.getAlerts(mockReq, mockRes)
 
      // Assert
      expect(Alert.getByUserId).toHaveBeenCalledWith(1)
      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({ error: 'Something happened to your db' })
    })
  })
 
  describe('markRead', () => {
    it('should mark an alert as read and return it with a 200 status code', async () => {
      // Arrange
      const testAlert = { alerts_id: 1, users_id: 1, pets_id: 1, alert_type: 'sighting', alert_message: 'Your pet was spotted!', alert_radius: 5, is_read: true, created_at: new Date() }
      const mockReq = { params: { alerts_id: 1 } }
      jest.spyOn(Alert, 'markAsRead').mockResolvedValue(new Alert(testAlert))
 
      // Act
      await alertsController.markRead(mockReq, mockRes)
 
      // Assert
      expect(Alert.markAsRead).toHaveBeenCalledWith(1)
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({ data: new Alert(testAlert) })
    })
 
    it('should return an error if the alert is not found', async () => {
      // Arrange
      const mockReq = { params: { alerts_id: 999 } }
      jest.spyOn(Alert, 'markAsRead').mockRejectedValue(new Error('Alert not found.'))
 
      // Act
      await alertsController.markRead(mockReq, mockRes)
 
      // Assert
      expect(Alert.markAsRead).toHaveBeenCalledWith(999)
      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({ error: 'Alert not found.' })
    })
  })
})