declare module '../services/emailService.js' {
  export function sendOTP(params: { to_email: string; otp_code: string }): Promise<boolean>;
}
