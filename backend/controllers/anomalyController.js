/**
 * @module anomalyController
 * @description Handles HTTP requests for the stadium anomalies endpoint.
 *
 * Workflow:
 *   1. Fetches the latest stadium data snapshot via {@link stadiumDataService}.
 *   2. Evaluates the snapshot against the rule engine.
 *   3. Returns detected anomalies in a standardised JSON envelope.
 */

const { getStadiumSnapshot } = require("../services/stadiumDataService");
const { detectAnomalies } = require("../services/ruleEngineService");
const logger = require("../utils/logger");

/**
 * GET /api/anomalies
 *
 * Retrieves the current stadium data snapshot, runs it through the static
 * rule engine, and responds with the resulting anomaly report.
 *
 * @async
 * @param {import("express").Request}  _req - Express request (unused).
 * @param {import("express").Response} res  - Express response.
 * @returns {Promise<void>} Resolves after the response is sent.
 */
async function getAnomalies(_req, res) {
  try {
    const snapshot = await getStadiumSnapshot();
    const anomalyReport = detectAnomalies(snapshot);

    res.status(200).json({
      success: true,
      data: anomalyReport,
    });
  } catch (err) {
    logger.error("API", "Error getting stadium anomalies:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to perform operational anomaly detection.",
    });
  }
}

module.exports = {
  getAnomalies,
};
