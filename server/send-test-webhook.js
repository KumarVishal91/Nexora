require("dotenv").config();
const http = require("http");
const { generateSignature } = require("./src/utils/signature");

const eventType = process.argv[2] || "payment.success";
const eventId = "evt_" + Date.now();

const body = { eventId, event: eventType, source: "test-script", amount: 4999 };
const rawBody = JSON.stringify(body);
const secret = process.env.WEBHOOK_SECRET || "supersecret_change_me";
const signature = generateSignature(rawBody, secret);

console.log("Sending webhook:", eventType, eventId);

const req = http.request(
  {
    hostname: "127.0.0.1",
    port: 4000,
    path: "/api/webhooks",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(rawBody),
      "x-nexora-signature": signature,
    },
  },
  (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      console.log("Status:", res.statusCode);
      console.log("Response:", data);
    });
  }
);

req.on("error", (err) => {
  console.error("Request error:", err.message);
});

req.write(rawBody);
req.end();