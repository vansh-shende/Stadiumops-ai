/**
 * =========================================================
 *  StadiumOps AI — Gate Traffic Routes
 * =========================================================
 *
 *  Responsibility:
 *    Define HTTP route mappings for the Gate_Traffic resource.
 *    All business logic lives in controllers/gatesController.js.
 *
 *  Endpoints:
 *    GET /api/gates — returns all gate traffic records.
 */

const express = require("express");
const router = express.Router();
const { getAllGates, handleGateAction } = require("../controllers/gatesController");

// --------------- Route Definitions ---------------

router.get("/", getAllGates);
router.post("/action", handleGateAction);

// --------------- Exports ---------------

module.exports = router;
