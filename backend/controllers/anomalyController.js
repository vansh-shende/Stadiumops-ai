/**
 * =========================================================
 *  StadiumOps AI — Anomaly Controller
 * =========================================================
 *
 *  Responsibility:
 *    Handle HTTP requests for the stadium anomalies endpoint.
 *    1. Fetches the latest stadium data snapshot using stadiumDataService.
 *    2. Evaluates the snapshot against the rule engine.
 *    3. Returns the detected anomalies in JSON format.
 */

const { getStadiumSnapshot } = require("../services/stadiumDataService");
const { detectAnomalies } = require("../services/ruleEngineService");
const logger = require("../utils/logger");

/**
 * GET /api/anomalies
 * Evaluates rules against live stadium data and returns detected anomalies.
 */
async function getAnomalies(_req, res) {
  try {
    // 1. Fetch current stadium data snapshot
    const snapshot = await getStadiumSnapshot();

    // 2. Pass it to the rule engine to run static checks
    const anomalyReport = detectAnomalies(snapshot);

    // 3. Return the evaluation result
    res.status(200).json({
      success: true,
      data: anomalyReport
    });
  } catch (err) {
    logger.error("API", "Error getting stadium anomalies:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to perform operational anomaly detection."
    });
  }
}

module.exports = {
  getAnomalies
};
