/**
 * =========================================================
 *  StadiumOps AI — Live Alert Routes
 * =========================================================
 *
 *  Responsibility:
 *    Define HTTP route mappings for live alerts.
 *    All retrieval logic is delegated to controllers/liveAlertController.js.
 *
 *  Endpoints:
 *    GET /api/live-alerts — returns cached AI directives.
 */

const express = require("express");
const router = express.Router();
const { getLiveAlerts } = require("../controllers/liveAlertController");

// --------------- Route Definitions ---------------

router.get("/", getLiveAlerts);

module.exports = router;
