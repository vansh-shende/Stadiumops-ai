/**
 * =========================================================
 *  StadiumOps AI — Alert History Routes
 * =========================================================
 *
 *  Responsibility:
 *    Define HTTP route mappings for alert history.
 *    Delegates processing to controllers/liveAlertController.js.
 *
 *  Endpoints:
 *    GET /api/alert-history — Returns the latest 50 alerts in-memory, newest first.
 */

const express = require("express");
const router = express.Router();
const { getHistory } = require("../controllers/liveAlertController");

// --------------- Route Definitions ---------------

router.get("/", getHistory);

module.exports = router;
