const prisma = require("../config/prisma");
const { enqueueEvent } = require("../queue/queue");

// GET /api/events?status=FAILED
async function listEvents(req, res) {
  const { status } = req.query;
  const events = await prisma.event.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  res.json(events);
}

// GET /api/events/stats
async function getStats(req, res) {
  const [total, success, failed, pending, deadLetter] = await Promise.all([
    prisma.event.count(),
    prisma.event.count({ where: { status: "SUCCESS" } }),
    prisma.event.count({ where: { status: "FAILED" } }),
    prisma.event.count({ where: { status: "PENDING" } }),
    prisma.event.count({ where: { status: "DEAD_LETTER" } }),
  ]);
  res.json({ total, success, failed, pending, deadLetter });
}

// GET /api/events/:id
async function getEvent(req, res) {
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!event) return res.status(404).json({ error: "Event not found" });
  res.json(event);
}

// POST /api/events/:id/replay
async function replayEvent(req, res) {
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!event) return res.status(404).json({ error: "Event not found" });

  await prisma.event.update({
    where: { id: event.id },
    data: { status: "PENDING", lastError: null },
  });

  const payload = JSON.parse(event.payload);
  await enqueueEvent(event.id, event.eventType, payload);

  res.json({ message: "Event re-queued for processing", eventId: event.eventId });
}

module.exports = { listEvents, getStats, getEvent, replayEvent };
