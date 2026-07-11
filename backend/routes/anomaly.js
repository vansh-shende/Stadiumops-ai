/**
 * =========================================================
 *  StadiumOps AI — Anomaly Routes
 * =========================================================
 *
 *  Responsibility:
 *    Define HTTP route mappings for anomaly detection.
 *    All evaluation logic is delegated to controllers/anomalyController.js.
 *
 *  Endpoints:
 *    GET /api/anomalies — returns live operational anomalies.
 */

const express = require("express");
const router = express.Router();
const { getAnomalies } = require("../controllers/anomalyController");

// --------------- Route Definitions ---------------

router.get("/", getAnomalies);

module.exports = router;
