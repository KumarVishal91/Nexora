require("dotenv").config();
const { Worker } = require("bullmq");
const connection = require("../config/redis");
const prisma = require("../config/prisma");

/**
 * This is where the "automation" actually happens.
 * Right now it just simulates work + logs. Replace processEvent()
 * with real actions: send email, call CRM, post to Slack, etc.
 */
async function processEvent(job) {
  const { eventDbId, eventType, payload } = job.data;

  console.log(`⚙️  Processing job ${job.id} — ${eventType}`);

  await prisma.event.update({
    where: { id: eventDbId },
    data: { status: "PROCESSING" },
  });

  // --- Simulated business logic (swap with real integrations) ---
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (eventType === "force.fail") {
    // Lets you test retries/DLQ on demand: send eventType "force.fail"
    throw new Error("Simulated downstream failure (e.g. CRM API returned 500)");
  }

  console.log(`   → action: send email, update CRM, notify Slack for`, eventType);
  // ----------------------------------------------------------------

  await prisma.event.update({
    where: { id: eventDbId },
    data: { status: "SUCCESS", processedAt: new Date() },
  });
}

const worker = new Worker(
  "event-processing",
  async (job) => {
    await processEvent(job);
  },
  { connection, concurrency: 5 }
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", async (job, err) => {
  const attemptsMade = job.attemptsMade;
  const maxAttempts = job.opts.attempts;

  console.log(`❌ Job ${job.id} failed (attempt ${attemptsMade}/${maxAttempts}): ${err.message}`);

  await prisma.event.update({
    where: { id: job.data.eventDbId },
    data: {
      status: attemptsMade >= maxAttempts ? "DEAD_LETTER" : "PENDING",
      attempts: attemptsMade,
      lastError: err.message,
    },
  });

  if (attemptsMade >= maxAttempts) {
    console.log(`☠️  Event ${job.data.eventDbId} moved to DEAD LETTER QUEUE after ${attemptsMade} attempts`);
  }
});

console.log("👷 Nexora worker started — waiting for jobs...");

module.exports = worker;
