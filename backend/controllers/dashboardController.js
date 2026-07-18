/**
 * =========================================================
 *  StadiumOps AI — Dashboard Controller
 * =========================================================
 *
 *  Responsibility:
 *    Aggregates data from all three tables into a single
 *    unified snapshot for the dashboard endpoint.
 *    Reuses stadiumDataService to avoid duplicate SQL queries.
 */

const { getStadiumSnapshot } = require("../services/stadiumDataService");
const logger = require("../utils/logger");

/**
 * GET /api/dashboard
 * Returns a unified JSON object containing gates, inventory,
 * staff, and a generatedAt timestamp.
 *
 * @async
 * @param {import("express").Request} _req - Express request object (unused).
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>} Sends JSON response with success indicator and unified dashboard data.
 */
async function getDashboard(_req, res) {
  try {
    const snapshot = await getStadiumSnapshot();

    res.status(200).json({
      success: true,
      data: {
        gates: snapshot.gateTraffic,
        inventory: snapshot.inventory,
        staff: snapshot.staff,
        generatedAt: snapshot.generatedAt,
      },
    });
  } catch (err) {
    logger.error("API", "Error fetching dashboard data:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve dashboard data.",
    });
  }
}

// --------------- Exports ---------------

module.exports = { getDashboard };
