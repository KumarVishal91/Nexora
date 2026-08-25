const prisma = require("../config/prisma");

/**
 * Checks if we've already seen this eventId before.
 * Returns the existing event if it's a duplicate, otherwise null.
 */
async function findExistingEvent(eventId) {
  return prisma.event.findUnique({ where: { eventId } });
}

module.exports = { findExistingEvent };
