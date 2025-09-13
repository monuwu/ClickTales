import express, { Request, Response } from 'express'
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server'

const router = express.Router()

// In-memory store for users' WebAuthn credentials (replace with DB in production)
const userCredentials: Record<string, any> = {}
const userChallenges: Record<string, any> = {}

// Generate registration options for WebAuthn enrollment
router.get('/webauthn/register-options', async (req: Request, res: Response) => {
  const { email } = req.query
  if (typeof email !== 'string') {
    return res.status(400).json({ success: false, error: 'Email is required' })
  }

  const options = await generateRegistrationOptions({
    rpName: 'ClickTales',
    rpID: req.hostname,
    userID: Buffer.from(email, 'utf-8'),
    userName: email,
    attestationType: 'direct',
    authenticatorSelection: {
      userVerification: 'preferred',
      authenticatorAttachment: 'cross-platform'
    }
  })

  userChallenges[email] = options.challenge

  res.json(options)
})

// Verify registration response from client
router.post('/webauthn/register', async (req: Request, res: Response) => {
  const { email, attestationResponse } = req.body
  if (!email || !attestationResponse) {
    return res.status(400).json({ success: false, error: 'Missing parameters' })
  }

  const expectedChallenge = userChallenges[email]
  if (!expectedChallenge) {
    return res.status(400).json({ success: false, error: 'No challenge found for user' })
  }

  try {
    const verification = await verifyRegistrationResponse({
      response: attestationResponse,
      expectedChallenge,
      expectedOrigin: `http://${req.hostname}:5173`,
      expectedRPID: req.hostname
    })

    if (verification.verified) {
      userCredentials[email] = verification.registrationInfo
      delete userChallenges[email]
      return res.json({ success: true })
    } else {
      return res.status(400).json({ success: false, error: 'Verification failed' })
    }
  } catch (error) {
    return res.status(400).json({ success: false, error: (error as Error).message })
  }
})

// Generate authentication options for WebAuthn login
router.get('/webauthn/authenticate-options', async (req: Request, res: Response) => {
  const { email } = req.query
  if (typeof email !== 'string') {
    return res.status(400).json({ success: false, error: 'Email is required' })
  }

  const userCred = userCredentials[email]
  if (!userCred) {
    return res.status(400).json({ success: false, error: 'User has no registered credentials' })
  }

  const options = await generateAuthenticationOptions({
    rpID: req.hostname,
    allowCredentials: [
      {
        id: userCred.credentialID,
        transports: ['usb', 'ble', 'nfc', 'internal']
      }
    ],
    userVerification: 'preferred'
  })

  userChallenges[email] = options.challenge

  res.json(options)
})

// Verify authentication response from client
router.post('/webauthn/authenticate', async (req: Request, res: Response) => {
  const { email, assertionResponse } = req.body
  if (!email || !assertionResponse) {
    return res.status(400).json({ success: false, error: 'Missing parameters' })
  }

  const expectedChallenge = userChallenges[email]
  const userCred = userCredentials[email]
  if (!expectedChallenge || !userCred) {
    return res.status(400).json({ success: false, error: 'No challenge or credentials found for user' })
  }

  try {
    const verification = await verifyAuthenticationResponse({
      response: assertionResponse,
      expectedChallenge,
      expectedOrigin: `http://${req.hostname}:5173`,
      expectedRPID: req.hostname,
      credential: userCred
    })

    if (verification.verified) {
      delete userChallenges[email]
      // Here you would create a session or JWT token for the user
      return res.json({ success: true })
    } else {
      return res.status(400).json({ success: false, error: 'Authentication failed' })
    }
  } catch (error) {
    return res.status(400).json({ success: false, error: (error as Error).message })
  }
})

export default router
