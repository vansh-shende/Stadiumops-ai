/**
 * =========================================================
 *  StadiumOps AI — Stadium Controller
 * =========================================================
 *
 *  Responsibility:
 *    Handle HTTP requests for the unified stadium data endpoint.
 *    Delegates data fetching to services/stadiumDataService.js.
 */

const { getStadiumSnapshot } = require("../services/stadiumDataService");
const logger = require("../utils/logger");

/**
 * GET /api/stadium
 * Returns a full operational snapshot of all stadium data.
 */
async function getSnapshot(_req, res) {
  try {
    const snapshot = await getStadiumSnapshot();

    res.status(200).json({
      success: true,
      data: snapshot,
    });
  } catch (err) {
    logger.error("API", "Error fetching stadium snapshot:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve stadium snapshot.",
    });
  }
}

// --------------- Exports ---------------

module.exports = { getSnapshot };
