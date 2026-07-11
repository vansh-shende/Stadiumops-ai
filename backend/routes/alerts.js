/**
 * =========================================================
 *  StadiumOps AI — Alert Routes
 * =========================================================
 *
 *  Responsibility:
 *    Define HTTP route mappings for alerting/command directives.
 *    Delegates processing to controllers/aiController.js.
 *
 *  Endpoints:
 *    POST /api/alerts — Evaluates anomalies and returns tactical directives.
 */

const express = require("express");
const router = express.Router();
const { getAlerts } = require("../controllers/aiController");

// --------------- Route Definitions ---------------

router.post("/", getAlerts);

module.exports = router;
