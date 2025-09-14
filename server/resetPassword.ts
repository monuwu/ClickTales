import bcrypt from 'bcrypt'
import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.resolve(__dirname, 'clicktales.db')
const db = new Database(dbPath)

async function resetPassword(email: string, newPassword: string) {
  try {
    const hash = await bcrypt.hash(newPassword, 10)
    const stmt = db.prepare('UPDATE users SET password_hash = ? WHERE email = ?')
    const result = stmt.run(hash, email)
    console.log(`Password reset for ${email}. Rows affected: ${result.changes}`)
  } catch (error) {
    console.error('Error resetting password:', error)
  } finally {
    db.close()
  }
}

// Usage: ts-node server/resetPassword.ts <email> <password>
const args = process.argv.slice(2)
if (args.length !== 2) {
  console.log('Usage: ts-node server/resetPassword.ts <email> <password>')
  process.exit(1)
}

resetPassword(args[0], args[1])
