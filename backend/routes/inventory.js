/**
 * =========================================================
 *  StadiumOps AI — Concession Inventory Routes
 * =========================================================
 *
 *  Responsibility:
 *    Define HTTP route mappings for the Concession_Inventory resource.
 *    All business logic lives in controllers/inventoryController.js.
 *
 *  Endpoints:
 *    GET /api/inventory — returns all concession inventory records.
 */

const express = require("express");
const router = express.Router();
const { getAllInventory } = require("../controllers/inventoryController");

// --------------- Route Definitions ---------------

router.get("/", getAllInventory);

// --------------- Exports ---------------

module.exports = router;
