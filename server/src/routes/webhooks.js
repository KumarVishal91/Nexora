const express = require("express");
const router = express.Router();

const hmacMiddleware = require("../middleware/hmac");
const webhookRateLimiter = require("../middleware/rateLimiter");
const { receiveWebhook } = require("../controllers/webhookController");

// Order matters: rate limit first (cheap check), then verify signature, then process
router.post("/", webhookRateLimiter, hmacMiddleware, receiveWebhook);

module.exports = router;
