import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.resolve(__dirname, 'clicktales.db')

// Create database file if it doesn't exist
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, '')
}

const db = new Database(dbPath)

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    username TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS webauthn_credentials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    credential_id TEXT NOT NULL,
    public_key TEXT NOT NULL,
    counter INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(email, credential_id)
  );

  CREATE TABLE IF NOT EXISTS otp_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

export default db

// Helper functions
export const getUserByEmail = (email: string) => {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
  return stmt.get(email)
}

export const createUser = (email: string, passwordHash: string, name?: string, username?: string) => {
  const stmt = db.prepare('INSERT INTO users (email, password_hash, name, username) VALUES (?, ?, ?, ?)')
  return stmt.run(email, passwordHash, name, username)
}

export const getWebAuthnCredential = (email: string, credentialId: string) => {
  const stmt = db.prepare('SELECT * FROM webauthn_credentials WHERE email = ? AND credential_id = ?')
  return stmt.get(email, credentialId)
}

export const saveWebAuthnCredential = (email: string, credentialId: string, publicKey: string, counter: number = 0) => {
  const stmt = db.prepare('INSERT OR REPLACE INTO webauthn_credentials (email, credential_id, public_key, counter) VALUES (?, ?, ?, ?)')
  return stmt.run(email, credentialId, publicKey, counter)
}

export const getWebAuthnCredentials = (email: string) => {
  const stmt = db.prepare('SELECT * FROM webauthn_credentials WHERE email = ?')
  return stmt.all(email)
}

export const updateWebAuthnCounter = (email: string, credentialId: string, counter: number) => {
  const stmt = db.prepare('UPDATE webauthn_credentials SET counter = ? WHERE email = ? AND credential_id = ?')
  return stmt.run(counter, email, credentialId)
}

export const storeOTP = (email: string, code: string, expiresInMinutes: number = 10) => {
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString()
  const stmt = db.prepare('INSERT INTO otp_codes (email, code, expires_at) VALUES (?, ?, ?)')
  return stmt.run(email, code, expiresAt)
}

export const verifyOTP = (email: string, code: string) => {
  const stmt = db.prepare('SELECT * FROM otp_codes WHERE email = ? AND code = ? AND expires_at > datetime("now") ORDER BY created_at DESC LIMIT 1')
  const row = stmt.get(email, code) as { id: number } | undefined
  if (row) {
    // Delete used OTP
    const deleteStmt = db.prepare('DELETE FROM otp_codes WHERE id = ?')
    deleteStmt.run(row.id)
    return true
  }
  return false
}
