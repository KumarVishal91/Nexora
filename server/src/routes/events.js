const express = require("express");
const router = express.Router();
const { listEvents, getStats, getEvent, replayEvent } = require("../controllers/eventController");

router.get("/stats", getStats);
router.get("/", listEvents);
router.get("/:id", getEvent);
router.post("/:id/replay", replayEvent);

module.exports = router;
