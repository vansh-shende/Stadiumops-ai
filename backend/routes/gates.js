/**
 * =========================================================
 *  StadiumOps AI — Gate Traffic Routes
 * =========================================================
 *
 *  Responsibility:
 *    Define HTTP route mappings for the Gate_Traffic resource.
 *    All business logic lives in controllers/gatesController.js.
 *    Input validation is handled by middleware/validateRequest.js.
 *
 *  Endpoints:
 *    GET  /api/gates        — returns all gate traffic records.
 *    POST /api/gates/action — trigger a manual operational command.
 */

const express = require("express");
const router = express.Router();
const { getAllGates, handleGateAction } = require("../controllers/gatesController");
const { gateActionRules, handleValidationErrors } = require("../middleware/validateRequest");

// --------------- Route Definitions ---------------

router.get("/", getAllGates);
router.post("/action", gateActionRules, handleValidationErrors, handleGateAction);

// --------------- Exports ---------------

module.exports = router;
