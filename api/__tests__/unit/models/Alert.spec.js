const Alert = require('../../../model/Alert')
const db = require('../../../database/connect')
 
describe('Alert', () => {
  beforeEach(() => jest.clearAllMocks())
  afterAll(() => jest.resetAllMocks())
 
  describe('getByUserId', () => {
    it('resolves with alerts on successful db query', async () => {
      // Arrange
      const mockAlerts = [
        { alerts_id: 1, users_id: 1, pets_id: 1, alert_type: 'sighting', alert_message: 'Your pet was spotted!', alert_radius: 5, is_read: false, created_at: new Date() },
        { alerts_id: 2, users_id: 1, pets_id: 2, alert_type: 'sighting', alert_message: 'Your pet was spotted again!', alert_radius: 5, is_read: false, created_at: new Date() },
      ]
      jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: mockAlerts })
 
      // Act
      const alerts = await Alert.getByUserId(1)
 
      // Assert
      expect(alerts).toHaveLength(2)
      expect(alerts[0]).toBeInstanceOf(Alert)
      expect(alerts[0].alerts_id).toBe(1)
      expect(alerts[0].alert_type).toBe('sighting')
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM alerts WHERE users_id = $1 ORDER BY created_at DESC;",
        [1]
      )
    })
 
    it('resolves with an empty array when no alerts are found', async () => {
      // Arrange
      jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: [] })
 
      // Act
      const alerts = await Alert.getByUserId(1)
 
      // Assert
      expect(alerts).toHaveLength(0)
    })
  })
 
  describe('markAsRead', () => {
    it('resolves with the updated alert on successful db query', async () => {
      // Arrange
      const mockAlert = { alerts_id: 1, users_id: 1, pets_id: 1, alert_type: 'sighting', alert_message: 'Your pet was spotted!', alert_radius: 5, is_read: true, created_at: new Date() }
      jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: [mockAlert] })
 
      // Act
      const result = await Alert.markAsRead(1)
 
      // Assert
      expect(result).toBeInstanceOf(Alert)
      expect(result.alerts_id).toBe(1)
      expect(result.is_read).toBe(true)
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE alerts SET is_read = true WHERE alerts_id = $1 RETURNING *;",
        [1]
      )
    })
 
    it('should throw an Error when alert is not found', async () => {
      // Arrange
      jest.spyOn(db, 'query').mockResolvedValueOnce({ rows: [] })
 
      // Act & Assert
      await expect(Alert.markAsRead(999)).rejects.toThrow('Alert not found.')
    })
  })
})