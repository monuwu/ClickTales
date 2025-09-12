// Simple OTP generator utility
export const generateOTP = (): string => {
  // Generate a 5-digit numeric OTP
  const otp = Math.floor(10000 + Math.random() * 90000).toString()
  return otp
}

export const isValidOTP = (otp: string): boolean => {
  // Check if OTP is 5 digits and numeric
  return /^\d{5}$/.test(otp)
}

// Store OTP with expiration (5 minutes)
const otpStore = new Map<string, { code: string; expires: number }>()

export const storeOTP = (email: string, otp: string): void => {
  const expires = Date.now() + 5 * 60 * 1000 // 5 minutes
  otpStore.set(email.toLowerCase(), { code: otp, expires })
}

export const verifyOTP = (email: string, otp: string): boolean => {
  const stored = otpStore.get(email.toLowerCase())
  if (!stored) return false

  // Check if OTP has expired
  if (Date.now() > stored.expires) {
    otpStore.delete(email.toLowerCase())
    return false
  }

  // Check if OTP matches
  const isValid = stored.code === otp
  if (isValid) {
    otpStore.delete(email.toLowerCase()) // One-time use
  }
  return isValid
}

// For testing purposes - get stored OTP
export const getStoredOTP = (email: string): string | null => {
  const stored = otpStore.get(email.toLowerCase())
  return stored && Date.now() <= stored.expires ? stored.code : null
}
