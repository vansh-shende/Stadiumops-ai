/**
 * =========================================================
 *  StadiumOps AI — Staff Controller
 * =========================================================
 *
 *  Responsibility:
 *    Contains the business logic for the Staff_Logistics resource.
 *    Called by routes/staff.js — the route layer stays thin.
 */

const { dbAll } = require("../config/database");
const logger = require("../utils/logger");

/**
 * GET /api/staff
 * Returns all Staff_Logistics records ordered by updated_at DESC.
 *
 * @async
 * @param {import("express").Request} _req - Express request object (unused).
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>} Sends JSON response with all staff logistics data.
 */
async function getAllStaff(_req, res) {
  try {
    const staff = await dbAll(
      "SELECT * FROM Staff_Logistics ORDER BY updated_at DESC"
    );

    res.status(200).json({
      success: true,
      count: staff.length,
      data: staff,
    });
  } catch (err) {
    logger.error("API", "Error fetching staff logistics:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve staff logistics data.",
    });
  }
}

// --------------- Exports ---------------

module.exports = { getAllStaff };
