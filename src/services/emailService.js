export const sendOTPEmail = async (params) => {
  try {
    const response = await fetch('/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: params.to_email,
        otpCode: params.otp_code
      }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ Email sent successfully via server');
      return true;
    } else {
      console.error('❌ Email sending failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
};

// Mock email service for development/testing
export const sendMockOTPEmail = async (params) => {
  console.log(`📧 Mock Email Sent to ${params.to_email}:`);
  console.log(`Subject: Your OTP Code for Login`);
  console.log(`Dear ${params.to_name || params.to_email.split('@')[0]},`);
  console.log(`Your OTP code is: ${params.otp_code}`);
  console.log(`This code will expire in 10 minutes.`);
  console.log(`--- End of Mock Email ---`);

  return true;
};

// Use server service in development and production
export const sendOTP = sendOTPEmail;
