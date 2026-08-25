const prisma = require("../config/prisma");
const { findExistingEvent } = require("../services/idempotency");
const { enqueueEvent } = require("../queue/queue");

/**
 * POST /api/webhooks
 * Body: { "eventId": "evt_123", "event": "payment.success", "amount": 500, ... }
 *
 * Flow: (HMAC + rate limit already ran as middleware before this)
 *   1. Check idempotency (eventId already processed?)
 *   2. Store event in DB as PENDING
 *   3. Enqueue job to BullMQ
 *   4. Respond immediately (don't make the caller wait for processing)
 */
async function receiveWebhook(req, res) {
  try {
    const body = req.body;
    const eventId = body.eventId;
    const eventType = body.event;
    const source = body.source || "generic";

    if (!eventId || !eventType) {
      return res.status(400).json({ error: "eventId and event are required" });
    }

    // 1. Idempotency check
    const existing = await findExistingEvent(eventId);
    if (existing) {
      return res.status(200).json({
        message: "Duplicate event ignored (idempotent)",
        eventId,
        status: existing.status,
      });
    }

    // 2. Store in DB
    const event = await prisma.event.create({
      data: {
        eventId,
        eventType,
        source,
        payload: JSON.stringify(body),
        status: "PENDING",
      },
    });

    // 3. Enqueue for background processing
    await enqueueEvent(event.id, eventType, body);

    // 4. Respond immediately
    return res.status(202).json({
      message: "Webhook received and queued",
      eventId: event.eventId,
      status: event.status,
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { receiveWebhook };
