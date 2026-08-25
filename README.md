# Nexora — Webhook Automation Platform

"I built Nexora, a webhook automation platform that receives events, verifies them with HMAC-SHA256, deduplicates via idempotency keys, and processes them asynchronously through a Redis/BullMQ queue with automatic retries and dead-letter handling — plus a live dashboard to monitor and replay failed events."

```
nexora/
├── server/               ← Express API + Prisma + BullMQ worker
│   ├── src/
│   │   ├── app.js         Express app + raw body capture (needed for HMAC)
│   │   ├── server.js       Entry point
│   │   ├── config/         prisma.js, redis.js
│   │   ├── middleware/     hmac.js (signature check), rateLimiter.js
│   │   ├── controllers/    webhookController.js, eventController.js
│   │   ├── routes/         webhooks.js, events.js
│   │   ├── queue/          queue.js (BullMQ producer), worker.js (consumer)
│   │   ├── services/       idempotency.js
│   │   └── utils/          signature.js (HMAC-SHA256)
│   ├── prisma/schema.prisma
│   ├── send-test-webhook.js   ← fires a correctly-signed test request
│   └── .env.example
└── dashboard/index.html   ← zero-build live dashboard (auto-refreshes every 3s)
```

This already implements: webhook ingestion, HMAC verification, idempotency,
rate limiting, PostgreSQL/SQLite storage via Prisma, Redis + BullMQ background
processing, automatic retries with exponential backoff, dead-letter handling,
and event replay from the dashboard. That's the full Stage 1–3 roadmap.

## Run it (in this exact order)

### 1. Install Redis
You need a real Redis running locally.
```bash
docker run -d -p 6379:6379 redis
```
(No Docker? Install Redis natively: `brew install redis && redis-server` on Mac,
or `sudo apt install redis-server` on Linux.)

### 2. Set up the server
```bash
cd nexora/server
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
```
This creates a local SQLite file (`dev.db`) — no Postgres install needed to start.

### 3. Start the API (terminal 1)
```bash
npm run dev
```
You should see: `🚀 Nexora API running on http://localhost:4000`

### 4. Start the worker (terminal 2 — separate process, this is the point!)
```bash
npm run worker
```
You should see: `👷 Nexora worker started — waiting for jobs...`

### 5. Send a test webhook (terminal 3)
```bash
node send-test-webhook.js
```
Watch terminal 2 — you'll see the job get picked up and processed.

Try triggering a failure to watch retries + dead-letter kick in:
```bash
node send-test-webhook.js force.fail
```
Watch it retry 3 times with increasing delay, then flip to `DEAD_LETTER`.

### 6. Open the dashboard
Just open `dashboard/index.html` directly in your browser (double-click it,
or `open dashboard/index.html`). It polls your API every 3 seconds. Click
**Replay** on any failed event to requeue it.

## What to build next (optional, once this works)
- Swap SQLite → Postgres (one line change, see comment in `schema.prisma`)
- Replace the simulated logic in `worker.js` → real email/CRM/Slack calls
- Add a "workflows" table so event→action mapping is configurable instead of hardcoded
- Rebuild the dashboard in Next.js once the static version proves the concept

## Quick mental model
```
Webhook → rate limit → verify HMAC → idempotency check → save to DB (PENDING)
   → push job to Redis/BullMQ → respond 202 immediately
                                          ↓
                              Worker (separate process) picks it up
                                          ↓
                         SUCCESS  or  FAILED → retry → DEAD_LETTER → [Replay]
```
