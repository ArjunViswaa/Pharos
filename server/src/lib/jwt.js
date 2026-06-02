import jwt from "jsonwebtoken";

const DEFAULT_EXPIRES_IN = "7d";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set. Add it to server/.env");
  }
  return secret;
}

/**
 * Sign a JWT for a given user. Keeps the payload minimal — only what
 * downstream middleware needs to identify the caller.
 * @param {{ _id: any, role: string }} user
 * @param {{ expiresIn?: string | number }} [opts]
 * @returns {string}
 */
export function signToken(user, opts = {}) {
  const payload = {
    sub: String(user._id),
    role: user.role,
  };
  return jwt.sign(payload, getSecret(), {
    expiresIn: opts.expiresIn ?? DEFAULT_EXPIRES_IN,
  });
}

/**
 * Verify a JWT and return its payload. Throws if invalid or expired.
 * @param {string} token
 * @returns {{ sub: string, role: string, iat: number, exp: number }}
 */
export function verifyToken(token) {
  return jwt.verify(token, getSecret());
}
