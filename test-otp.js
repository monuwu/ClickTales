import fetch from 'node-fetch';

// Generate a 6-digit OTP code
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function testOTP() {
  try {
    const otpCode = generateOTP();
    const body = JSON.stringify({
      email: 'chahnasumeet23@gmail.com',
      otpCode: otpCode
    });

    console.log('Sending OTP request to http://localhost:4000/send-otp');
    console.log('Email: chahnasumeet23@gmail.com');
    console.log('OTP Code:', otpCode);
    console.log('Request body:', body);

    const response = await fetch('http://localhost:4000/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    });

    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response:', result);

    if (result.success) {
      console.log('✅ OTP email sent successfully!');
      console.log('Check your email for the OTP code.');
    } else {
      console.log('❌ Failed to send OTP email:', result.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testOTP();
