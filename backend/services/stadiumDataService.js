/**
 * =========================================================
 *  StadiumOps AI — Stadium Data Service
 * =========================================================
 *
 *  Responsibility:
 *    Collect all stadium operational data from SQLite and
 *    return a single structured snapshot object.
 *
 *  This service does NOT filter, detect anomalies, or call
 *  any AI model.  It is a pure data-access layer that any
 *  controller or service can consume.
 *
 *  Usage:
 *    const { getStadiumSnapshot } = require("../services/stadiumDataService");
 *    const snapshot = await getStadiumSnapshot();
 */

const { dbAll } = require("../config/database");
const logger = require("../utils/logger");

// --------------- Public API ---------------

/**
 * Fetch all rows from Gate_Traffic, Concession_Inventory and
 * Staff_Logistics and return them as a unified snapshot.
 *
 * @returns {Promise<Object>} Structured snapshot with timestamp.
 * @throws {Error} If any database query fails.
 */
async function getStadiumSnapshot() {
  try {
    // Run all three queries concurrently for speed.
    const [gateTraffic, inventory, staff] = await Promise.all([
      dbAll("SELECT * FROM Gate_Traffic ORDER BY updated_at DESC"),
      dbAll("SELECT * FROM Concession_Inventory ORDER BY updated_at DESC"),
      dbAll("SELECT * FROM Staff_Logistics ORDER BY updated_at DESC"),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      gateTraffic,
      inventory,
      staff,
    };
  } catch (err) {
    logger.error("StadiumData", "Failed to build stadium snapshot:", err.message);
    throw new Error(`Stadium snapshot failed: ${err.message}`);
  }
}

// --------------- Exports ---------------

module.exports = { getStadiumSnapshot };
