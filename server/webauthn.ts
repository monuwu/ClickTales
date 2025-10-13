import express, { Request, Response } from 'express'
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server'
import { getWebAuthnCredential, saveWebAuthnCredential, updateWebAuthnCounter, getWebAuthnCredentials } from './db'

const router = express.Router()

// In-memory store for challenges (temporary)
const userChallenges: Record<string, any> = {}

// Generate registration options for WebAuthn enrollment
router.get('/register-options', async (req: Request, res: Response) => {
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
router.post('/register', async (req: Request, res: Response) => {
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

    if (verification.verified && verification.registrationInfo) {
      const { credential } = verification.registrationInfo
      const credentialID = Buffer.from(credential.id).toString('base64')
      const credentialPublicKey = Buffer.from(credential.publicKey).toString('base64')
      saveWebAuthnCredential(email, credentialID, credentialPublicKey)
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
router.get('/authenticate-options', async (req: Request, res: Response) => {
  const { email } = req.query
  if (typeof email !== 'string') {
    return res.status(400).json({ success: false, error: 'Email is required' })
  }

  const userCreds = getWebAuthnCredentials(email)
  if (!userCreds || userCreds.length === 0) {
    return res.status(400).json({ success: false, error: 'User has no registered credentials' })
  }

  const allowCredentials = userCreds.map((cred: any) => ({
    id: cred.credential_id,
    transports: ['usb', 'ble', 'nfc', 'internal'] as any
  }))

  const options = await generateAuthenticationOptions({
    rpID: req.hostname,
    allowCredentials,
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
  const userCreds = getWebAuthnCredentials(email)
  if (!expectedChallenge || !userCreds || userCreds.length === 0) {
    return res.status(400).json({ success: false, error: 'No challenge or credentials found for user' })
  }

  try {
    // For simplicity, use the first credential for verification
    const credential: any = userCreds[0]
    const verification = await verifyAuthenticationResponse({
      response: assertionResponse,
      expectedChallenge,
      expectedOrigin: `http://${req.hostname}:5173`,
      expectedRPID: req.hostname,
      credential: {
        id: Buffer.from(credential.credential_id, 'base64'),
        publicKey: Buffer.from(credential.public_key, 'base64'),
        counter: credential.counter
      } as any
    })

    if (verification.verified) {
      // Update counter in DB
      updateWebAuthnCounter(email, credential.credential_id, verification.authenticationInfo.newCounter)
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
