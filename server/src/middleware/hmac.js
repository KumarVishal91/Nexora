const { verifySignature } = require("../utils/signature");

/**
 * Verifies the "x-nexora-signature" header against the raw request body.
 * Requires app.js to capture the raw body (see verifyRawBody in app.js).
 */
function hmacMiddleware(req, res, next) {
  const secret = process.env.WEBHOOK_SECRET;
  const signature = req.headers["x-nexora-signature"];

  const isValid = verifySignature(req.rawBody, secret, signature);

  if (!isValid) {
    return res.status(401).json({ error: "Invalid or missing signature" });
  }

  next();
}

module.exports = hmacMiddleware;
