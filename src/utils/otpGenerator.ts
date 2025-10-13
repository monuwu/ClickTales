// OTP (One-Time Password) generator and verification utilities

interface OTPData {
  code: string
  expiresAt: number
}

// In-memory storage for OTPs (in production, use Redis or database)
const otpStore = new Map<string, OTPData>()

// Clean up expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(email)
    }
  }
}, 5 * 60 * 1000)

/**
 * Generate a random 5-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(10000 + Math.random() * 90000).toString()
}

/**
 * Store OTP for an email with expiration time
 * @param email - User's email address
 * @param code - The OTP code
 * @param expiryMinutes - Expiry time in minutes (default: 10)
 */
export function storeOTP(email: string, code: string, expiryMinutes: number = 10): void {
  const expiresAt = Date.now() + expiryMinutes * 60 * 1000
  otpStore.set(email.toLowerCase(), { code, expiresAt })
}

/**
 * Verify OTP for an email
 * @param email - User's email address
 * @param code - The OTP code to verify
 * @returns true if valid, false otherwise
 */
export function verifyOTP(email: string, code: string): boolean {
  const emailKey = email.toLowerCase()
  const storedData = otpStore.get(emailKey)

  if (!storedData) {
    return false // No OTP found
  }

  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(emailKey) // Clean up expired OTP
    return false // OTP expired
  }

  if (storedData.code !== code) {
    return false // Invalid code
  }

  // OTP is valid, remove it from store (single use)
  otpStore.delete(emailKey)
  return true
}

/**
 * Get remaining time for OTP in seconds
 * @param email - User's email address
 * @returns remaining time in seconds or 0 if expired/not found
 */
export function getOTPRemainingTime(email: string): number {
  const storedData = otpStore.get(email.toLowerCase())
  if (!storedData) return 0

  const remainingMs = storedData.expiresAt - Date.now()
  return Math.max(0, Math.floor(remainingMs / 1000))
}

/**
 * Clear OTP for an email (useful for cleanup)
 * @param email - User's email address
 */
export function clearOTP(email: string): void {
  otpStore.delete(email.toLowerCase())
}
