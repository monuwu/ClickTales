// @ts-ignore
global.fetch = jest.fn()

const baseUrl = 'http://localhost:4000'

async function testSendOtp(email: string, otpCode: string) {
  const response = await fetch(`${baseUrl}/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otpCode }),
  })
  const data = await response.json()
  return { status: response.status, data }
}

describe('Send OTP API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should send OTP successfully with valid data', async () => {
    const mockResponse = { success: true, message: 'OTP sent successfully' }
    // @ts-ignore
    global.fetch.mockResolvedValueOnce({
      status: 200,
      json: jest.fn().mockResolvedValue(mockResponse),
    })

    const result = await testSendOtp('test@example.com', '123456')

    expect(global.fetch).toHaveBeenCalledWith(`${baseUrl}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', otpCode: '123456' }),
    })
    expect(result.status).toBe(200)
    expect(result.data).toEqual(mockResponse)
  })

  test('should handle missing email', async () => {
    const mockResponse = { success: false, error: 'Email is required' }
    // @ts-ignore
    global.fetch.mockResolvedValueOnce({
      status: 400,
      json: jest.fn().mockResolvedValue(mockResponse),
    })

    const result = await testSendOtp('', '123456')

    expect(result.status).toBe(400)
    expect(result.data).toEqual(mockResponse)
  })

  test('should handle missing otpCode', async () => {
    const mockResponse = { success: false, error: 'OTP code is required' }
    // @ts-ignore
    global.fetch.mockResolvedValueOnce({
      status: 400,
      json: jest.fn().mockResolvedValue(mockResponse),
    })

    const result = await testSendOtp('test@example.com', '')

    expect(result.status).toBe(400)
    expect(result.data).toEqual(mockResponse)
  })

  test('should handle invalid email format', async () => {
    const mockResponse = { success: false, error: 'Invalid email format' }
    // @ts-ignore
    global.fetch.mockResolvedValueOnce({
      status: 400,
      json: jest.fn().mockResolvedValue(mockResponse),
    })

    const result = await testSendOtp('invalid-email', '123456')

    expect(result.status).toBe(400)
    expect(result.data).toEqual(mockResponse)
  })

  test('should handle server errors', async () => {
    // @ts-ignore
    global.fetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(testSendOtp('test@example.com', '123456')).rejects.toThrow('Network error')
  })
})
