/**
 * =========================================================
 *  StadiumOps AI — Dashboard Aggregate Routes
 * =========================================================
 *
 *  Responsibility:
 *    Define HTTP route mappings for the unified dashboard endpoint.
 *    All business logic lives in controllers/dashboardController.js.
 *
 *  Endpoints:
 *    GET /api/dashboard — returns a unified snapshot of all tables.
 */

const express = require("express");
const router = express.Router();
const { getDashboard } = require("../controllers/dashboardController");

// --------------- Route Definitions ---------------

router.get("/", getDashboard);

// --------------- Exports ---------------

module.exports = router;
