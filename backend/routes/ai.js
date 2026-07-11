/**
 * =========================================================
 *  StadiumOps AI — AI Routes
 * =========================================================
 *
 *  Responsibility:
 *    Define HTTP route mappings for AI-related endpoints.
 *    All business logic lives in controllers/aiController.js.
 *
 *  Endpoints:
 *    GET /api/test-ai — verify Gemini integration.
 */

const express = require("express");
const router = express.Router();
const { testAI } = require("../controllers/aiController");

// --------------- Route Definitions ---------------

router.get("/", testAI);

// --------------- Exports ---------------

module.exports = router;
