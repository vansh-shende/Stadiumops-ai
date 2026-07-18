/**
 * @module stadiumDataService
 * @description Pure data-access layer for stadium operational telemetry.
 *
 * Collects rows from the three core SQLite tables — Gate_Traffic,
 * Concession_Inventory, and Staff_Logistics — and assembles them into
 * a single structured snapshot object.
 *
 * This service does NOT filter, detect anomalies, or invoke any AI model.
 * Any controller or downstream service can consume the snapshot it produces.
 *
 * @example
 *   const { getStadiumSnapshot } = require("../services/stadiumDataService");
 *   const snapshot = await getStadiumSnapshot();
 */

const { dbAll } = require("../config/database");
const logger = require("../utils/logger");

/**
 * Fetches all rows from Gate_Traffic, Concession_Inventory, and
 * Staff_Logistics concurrently and returns them as a unified snapshot.
 *
 * @async
 * @returns {Promise<{generatedAt: string, gateTraffic: Array, inventory: Array, staff: Array}>}
 *   A timestamped snapshot containing the three dataset arrays.
 * @throws {Error} If any of the underlying database queries fail.
 */
async function getStadiumSnapshot() {
  try {
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

module.exports = { getStadiumSnapshot };
