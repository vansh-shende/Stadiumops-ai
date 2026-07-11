/**
 * =========================================================
 *  StadiumOps AI — Dashboard Controller
 * =========================================================
 *
 *  Responsibility:
 *    Aggregates data from all three tables into a single
 *    unified snapshot for the dashboard endpoint.
 *    Called by routes/dashboard.js — the route layer stays thin.
 */

const { dbAll } = require("../config/database");
const logger = require("../utils/logger");

/**
 * GET /api/dashboard
 * Returns a unified JSON object containing gates, inventory,
 * staff, and a generatedAt timestamp.
 */
async function getDashboard(_req, res) {
  try {
    // Run all three queries concurrently for speed.
    const [gates, inventory, staff] = await Promise.all([
      dbAll("SELECT * FROM Gate_Traffic ORDER BY updated_at DESC"),
      dbAll("SELECT * FROM Concession_Inventory ORDER BY updated_at DESC"),
      dbAll("SELECT * FROM Staff_Logistics ORDER BY updated_at DESC"),
    ]);

    res.status(200).json({
      success: true,
      data: {
        gates,
        inventory,
        staff,
        generatedAt: new Date().toISOString(),
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
