/**
 * =========================================================
 *  StadiumOps AI — Stadium Routes
 * =========================================================
 *
 *  Responsibility:
 *    Define HTTP route mappings for the unified stadium endpoint.
 *    All business logic lives in controllers/stadiumController.js.
 *
 *  Endpoints:
 *    GET /api/stadium — returns a full operational snapshot.
 */

const express = require("express");
const router = express.Router();
const { getSnapshot } = require("../controllers/stadiumController");

// --------------- Route Definitions ---------------

router.get("/", getSnapshot);

// --------------- Exports ---------------

module.exports = router;
