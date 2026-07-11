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
        error: latest.alerts[0] || "Failed to retrieve live alerts."
      });
    }

    res.status(200).json({
      success: true,
      generatedAt: latest.generatedAt,
      anomalyCount: latest.anomalyCount,
      alerts: latest.alerts
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
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
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}

module.exports = {
  getLiveAlerts,
  getHistory
};
