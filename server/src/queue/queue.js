const { Queue } = require("bullmq");
const connection = require("../config/redis");

const eventQueue = new Queue("event-processing", { connection });

/**
 * Adds a job to the queue with automatic retries + exponential backoff.
 * After 3 failed attempts, BullMQ marks the job "failed" — our worker
 * catches that and moves the event into our own DEAD_LETTER status.
 */
async function enqueueEvent(eventDbId, eventType, payload) {
  await eventQueue.add(
    "process-event",
    { eventDbId, eventType, payload },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000, // 2s, 4s, 8s...
      },
      removeOnComplete: 1000,
      removeOnFail: false, // keep failed jobs so we can inspect / replay them
    }
  );
}

module.exports = { eventQueue, enqueueEvent };
