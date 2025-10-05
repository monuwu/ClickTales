import fetch from 'node-fetch';

async function testSendOtp() {
  const response = await fetch('http://localhost:4000/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@example.com', otpCode: '123456' }),
  });
  const data = await response.json();
  console.log('Send OTP response:', data);
}

async function runTests() {
  await testSendOtp();
}

runTests().catch(console.error);
