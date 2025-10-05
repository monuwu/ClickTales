<<<<<<< HEAD
import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'

// Initialize database
let db: Database<sqlite3.Database, sqlite3.Statement> | null = null

export async function initDB() {
  if (db) return db

  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database,
  })

  // Create users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create otp_codes table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS otp_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      otp_code TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create sessions table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `)

  return db
}

export async function getDB() {
  if (!db) {
    await initDB()
  }
  return db!
}

// User operations
export async function createUser(name: string, email: string, passwordHash: string, role: string = 'user') {
  const db = await getDB()
  const result = await db.run(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name, email, passwordHash, role]
  )
  return result.lastID
}

export async function getUserByEmail(email: string) {
  const db = await getDB()
  return await db.get('SELECT * FROM users WHERE email = ?', [email])
}

export async function getUserById(id: number) {
  const db = await getDB()
  return await db.get('SELECT * FROM users WHERE id = ?', [id])
}

// OTP operations
export async function storeOTP(email: string, otpCode: string, expiresInMinutes: number = 10) {
  const db = await getDB()
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)

  // Clean up expired OTPs first
  await db.run('DELETE FROM otp_codes WHERE expires_at < datetime("now")')

  // Insert new OTP
  await db.run(
    'INSERT INTO otp_codes (email, otp_code, expires_at) VALUES (?, ?, ?)',
    [email, otpCode, expiresAt.toISOString()]
  )
}

export async function verifyOTP(email: string, otpCode: string): Promise<boolean> {
  const db = await getDB()
  const otp = await db.get(
    'SELECT * FROM otp_codes WHERE email = ? AND otp_code = ? AND expires_at > datetime("now")',
    [email, otpCode]
  )

  if (otp) {
    // Delete the used OTP
    await db.run('DELETE FROM otp_codes WHERE id = ?', [otp.id])
    return true
  }

  return false
}

// Session operations
export async function createSession(userId: number, sessionToken: string, expiresInHours: number = 24) {
  const db = await getDB()
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000)

  await db.run(
    'INSERT INTO sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)',
    [userId, sessionToken, expiresAt.toISOString()]
  )
}

export async function getSessionByToken(sessionToken: string) {
  const db = await getDB()
  return await db.get(
    'SELECT s.*, u.name, u.email, u.role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.session_token = ? AND s.expires_at > datetime("now")',
    [sessionToken]
  )
}

export async function deleteSession(sessionToken: string) {
  const db = await getDB()
  await db.run('DELETE FROM sessions WHERE session_token = ?', [sessionToken])
}

// Clean up expired sessions (call periodically)
export async function cleanupExpiredSessions() {
  const db = await getDB()
  await db.run('DELETE FROM sessions WHERE expires_at < datetime("now")')
}
=======
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
>>>>>>> 474ef572850d675b821af8d159b2cb8cd72085a0
