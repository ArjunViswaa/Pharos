import bcrypt from "bcryptjs";

// Cost factor for bcrypt. 12 = ~250ms per hash on modern hardware,
// a sensible balance between user-facing latency and brute-force resistance.
const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password using bcrypt (salt is generated and embedded).
 * @param {string} plain
 * @returns {Promise<string>}
 */
export async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * Compare a plaintext password against a stored bcrypt hash.
 * @param {string} plain
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
