/**
 * =========================================================
 *  StadiumOps AI — Alert Routes
 * =========================================================
 *
 *  Responsibility:
 *    Define HTTP route mappings for alerting/command directives.
 *    Delegates processing to controllers/aiController.js.
 *    Input validation is handled by middleware/validateRequest.js.
 *
 *  Endpoints:
 *    POST /api/alerts — Evaluates anomalies and returns tactical directives.
 */

const express = require("express");
const router = express.Router();
const { getAlerts } = require("../controllers/aiController");
const { alertsRules, handleValidationErrors } = require("../middleware/validateRequest");

// --------------- Route Definitions ---------------

router.post("/", alertsRules, handleValidationErrors, getAlerts);

module.exports = router;
