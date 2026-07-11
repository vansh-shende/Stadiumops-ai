/**
 * =========================================================
 *  StadiumOps AI — Continuous Alert Engine Service
 * =========================================================
 *
 *  Responsibility:
 *    Continuously runs anomaly checks and AI directives generation
 *    every 10 seconds. Caches the latest directives in-memory
 *    so client requests can fetch them instantly without waiting
 *    for live Gemini API calls.
 */

const { getStadiumSnapshot } = require("./stadiumDataService");
const { detectAnomalies, generateFallbackDirectives } = require("./ruleEngineService");
const { buildPrompt } = require("../prompts/promptBuilder");
const { generateText } = require("./geminiService");
const logger = require("../utils/logger");

// --------------- In-Memory Alert Cache & History ---------------

let latestAlerts = {
  generatedAt: new Date().toISOString(),
  anomalyCount: 0,
  alerts: ["[INFO] Stadium operations are normal."],
  status: "completed" // "completed" | "processing" | "error"
};

const alertHistory = [
  {
    generatedAt: latestAlerts.generatedAt,
    anomalyCount: latestAlerts.anomalyCount,
    alerts: latestAlerts.alerts
  }
];

let intervalId = null;

/**
 * Adds an evaluation result to the history, keeping only the latest 50 entries.
 */
function addToHistory(entry) {
  alertHistory.unshift({
    generatedAt: entry.generatedAt,
    anomalyCount: entry.anomalyCount,
    alerts: entry.alerts
  });

  if (alertHistory.length > 50) {
    alertHistory.pop();
  }
}

// --------------- Engine Loop Logic ---------------

/**
 * Executes a single evaluation tick.
 * Reads the snapshot, checks anomalies, and triggers Gemini if required.
 */
async function runEngineTick() {
  // Prevent overlapping ticks if the Gemini API call is slow
  if (latestAlerts.status === "processing") {
    logger.info("AlertEngine", "Previous generation tick still in progress. Skipping loop tick.");
    return;
  }

  let anomalyCount = 0;
  try {
    const snapshot = await getStadiumSnapshot();
    const anomalyReport = detectAnomalies(snapshot);
    anomalyCount = anomalyReport.anomalyCount;

    // If no anomalies exist, immediately update cache without hitting Gemini
    if (anomalyReport.anomalyCount === 0) {
      latestAlerts = {
        generatedAt: new Date().toISOString(),
        anomalyCount: 0,
        alerts: ["[INFO] Stadium operations are normal."],
        status: "completed"
      };
      addToHistory(latestAlerts);
      return;
    }

    // Set status to processing so callers know the AI is generating alerts
    latestAlerts.status = "processing";
    logger.info("AlertEngine", `Anomalies detected: ${anomalyReport.anomalyCount}. Triggering Gemini...`);

    const prompt = buildPrompt(anomalyReport);
    let directives;
    try {
      const response = await generateText(prompt);
      directives = response
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      
      latestAlerts = {
        generatedAt: new Date().toISOString(),
        anomalyCount: anomalyReport.anomalyCount,
        alerts: directives,
        status: "completed"
      };
      logger.info("AlertEngine", "Successfully updated cached AI directives.");
    } catch (apiErr) {
      logger.warn("AlertEngine", `Gemini API failed, falling back to rule-based directives: ${apiErr.message}`);
      directives = generateFallbackDirectives(anomalyReport);
      
      latestAlerts = {
        generatedAt: new Date().toISOString(),
        anomalyCount: anomalyReport.anomalyCount,
        alerts: directives,
        status: "completed"
      };
    }

    addToHistory(latestAlerts);
  } catch (err) {
    logger.error("AlertEngine", "Failed engine tick:", err.message);
    
    // Maintain the correct anomaly count but mark as error
    latestAlerts = {
      generatedAt: new Date().toISOString(),
      anomalyCount: anomalyCount,
      alerts: [`[ERROR] Failed to update directives: ${err.message}`],
      status: "error"
    };
    addToHistory(latestAlerts);
  }
}

// --------------- Public API ---------------

/**
 * Start the Alert Engine execution loop using setInterval.
 */
function startAlertEngine() {
  if (intervalId) {
    logger.info("AlertEngine", "Alert Engine is already running.");
    return;
  }

  // Run the first evaluation tick immediately
  runEngineTick();

  // Run every 10 seconds
  intervalId = setInterval(runEngineTick, 10000);
  logger.info("AlertEngine", "Alert Engine loop initialized (10s interval).");
}

/**
 * Fetch the latest cached operational alerts.
 */
function getLatestAlerts() {
  return latestAlerts;
}

/**
 * Fetch the in-memory alerts history (newest first, max 50 entries).
 */
function getAlertHistory() {
  return alertHistory;
}

/**
 * Inject a custom action log entry into the alert history.
 */
function injectCustomAction(message) {
  alertHistory.unshift({
    generatedAt: new Date().toISOString(),
    anomalyCount: 0,
    alerts: [`[ACTION] ${message}`]
  });

  if (alertHistory.length > 50) {
    alertHistory.pop();
  }
}

module.exports = {
  startAlertEngine,
  getLatestAlerts,
  getAlertHistory,
  injectCustomAction
};
