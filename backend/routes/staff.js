/**
 * =========================================================
 *  StadiumOps AI — Staff Logistics Routes
 * =========================================================
 *
 *  Responsibility:
 *    Define HTTP route mappings for the Staff_Logistics resource.
 *    All business logic lives in controllers/staffController.js.
 *
 *  Endpoints:
 *    GET /api/staff — returns all staff logistics records.
 */

const express = require("express");
const router = express.Router();
const { getAllStaff } = require("../controllers/staffController");

// --------------- Route Definitions ---------------

router.get("/", getAllStaff);

// --------------- Exports ---------------

module.exports = router;
