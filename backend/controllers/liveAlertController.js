/**
 * =========================================================
 *  StadiumOps AI — Live Alert Controller
 * =========================================================
 *
 *  Responsibility:
 *    Handle HTTP requests for cached live operational alerts.
 *    Delegates to the running alertEngineService cache.
 */

const { getLatestAlerts, getAlertHistory } = require("../services/alertEngine");
const logger = require("../utils/logger");

/**
 * GET /api/live-alerts
 * Returns the cached AI command directives or indicating generating status.
 */
async function getLiveAlerts(_req, res) {
  try {
    const latest = getLatestAlerts();

    // If AI is currently generating alerts, return processing response
    if (latest.status === "processing") {
      return res.status(200).json({
        success: true,
        status: "processing"
      });
    }

    if (latest.status === "error") {
      return res.status(500).json({
        success: false,
        error: "Failed to retrieve live alerts. AI engine encountered an error."
      });
    }

    res.status(200).json({
      success: true,
      generatedAt: latest.generatedAt,
      anomalyCount: latest.anomalyCount,
      alerts: latest.alerts
    });
  } catch (err) {
    logger.error("LiveAlerts", "Error fetching live alerts:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve live alerts."
    });
  }
}

/**
 * GET /api/alert-history
 * Returns the list of the latest 50 alert reports, ordered newest first.
 */
async function getHistory(_req, res) {
  try {
    const history = getAlertHistory();
    res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (err) {
    logger.error("LiveAlerts", "Error fetching alert history:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve alert history."
    });
  }
}

module.exports = {
  getLiveAlerts,
  getHistory
};
