const rateLimit = require("express-rate-limit");

// Protects the webhook endpoint from being flooded (accidental loops or abuse)
const webhookRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
});

module.exports = webhookRateLimiter;
