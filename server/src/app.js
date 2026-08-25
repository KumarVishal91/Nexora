const express = require("express");
const cors = require("cors");
require("dotenv").config();

const webhookRoutes = require("./routes/webhooks");
const eventRoutes = require("./routes/events");

const app = express();

app.use(cors());

// IMPORTANT: we need the raw request body (exact bytes) to verify the HMAC
// signature, because signing happens over the raw bytes, not the parsed JSON.
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  })
);

app.get("/", (req, res) => {
  res.json({ status: "Nexora is running", time: new Date().toISOString() });
});

app.use("/api/webhooks", webhookRoutes);
app.use("/api/events", eventRoutes);

module.exports = app;
