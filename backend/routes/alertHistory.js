/**
 * =========================================================
 *  StadiumOps AI — Alert History Routes
 * =========================================================
 *
 * @module routes/alertHistory
 * @requires express
 * @requires controllers/liveAlertController
 */

const express = require("express");
const router = express.Router();
const { getHistory } = require("../controllers/liveAlertController");

// --------------- Route Definitions ---------------

router.get("/", getHistory);

module.exports = router;
