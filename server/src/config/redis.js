const IORedis = require("ioredis");
require("dotenv").config();

// BullMQ requires this specific option on the ioredis connection
const connection = new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: null,
});

module.exports = connection;
