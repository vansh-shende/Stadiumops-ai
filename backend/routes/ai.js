/**
 * =========================================================
 *  StadiumOps AI — AI Routes
 * =========================================================
 *
 * @module routes/ai
 * @requires express
 * @requires controllers/aiController
 */

const express = require("express");
const router = express.Router();
const { testAI } = require("../controllers/aiController");

// --------------- Route Definitions ---------------

router.get("/", testAI);

// --------------- Exports ---------------

module.exports = router;
