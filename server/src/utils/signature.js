const crypto = require("crypto");

/**
 * Generates an HMAC-SHA256 signature for a raw request body string.
 * Whoever sends the webhook must sign it the same way, using the same secret.
 */
function generateSignature(rawBody, secret) {
  return crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
}

/**
 * Timing-safe comparison so we don't leak info via response-time attacks.
 */
function verifySignature(rawBody, secret, incomingSignature) {
  if (!incomingSignature) return false;
  const expected = generateSignature(rawBody, secret);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(incomingSignature, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

module.exports = { generateSignature, verifySignature };
