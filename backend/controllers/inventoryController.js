/**
 * =========================================================
 *  StadiumOps AI — Inventory Controller
 * =========================================================
 *
 *  Responsibility:
 *    Contains the business logic for the Concession_Inventory resource.
 *    Called by routes/inventory.js — the route layer stays thin.
 */

const { dbAll } = require("../config/database");
const logger = require("../utils/logger");

/**
 * GET /api/inventory
 * Returns all Concession_Inventory records ordered by updated_at DESC.
 *
 * @async
 * @param {import("express").Request} _req - Express request object (unused).
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>} Sends JSON response with all concession inventory data.
 */
async function getAllInventory(_req, res) {
  try {
    const inventory = await dbAll(
      "SELECT * FROM Concession_Inventory ORDER BY updated_at DESC"
    );

    res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory,
    });
  } catch (err) {
    logger.error("API", "Error fetching inventory:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve concession inventory data.",
    });
  }
}

// --------------- Exports ---------------

module.exports = { getAllInventory };
