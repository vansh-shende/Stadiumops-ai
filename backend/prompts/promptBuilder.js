/**
 * =========================================================
 *  StadiumOps AI — Prompt Builder
 * =========================================================
 *
 *  Responsibility:
 *    Combine the Tactical Commander system prompt with the current
 *    anomaly list dynamically to form a complete instruction prompt.
 */

const { SYSTEM_PROMPT } = require("./tacticalCommanderPrompt");

/**
 * Builds the complete prompt for the AI model.
 *
 * @param {Object} anomalyData - The output JSON from detectAnomalies()
 * @returns {string} The fully combined prompt.
 */
function buildPrompt(anomalyData) {
  const anomalies = anomalyData && Array.isArray(anomalyData.anomalies) ? anomalyData.anomalies : [];

  let anomalySection = "";
  if (anomalies.length === 0) {
    anomalySection = "No active anomalies or issues detected.";
  } else {
    anomalySection = anomalies
      .map((a, idx) => `Anomaly ${idx + 1}:
- Type: ${a.type}
- Severity: ${a.severity}
- Location: ${a.location}
- Message: ${a.message}
- Recommendation: ${a.recommendation}`)
      .join("\n\n");
  }

  return `${SYSTEM_PROMPT}

=========================================
CURRENT ANOMALY DATA
=========================================
${anomalySection}

=========================================
CLEAR INSTRUCTION
=========================================
Generate operational directives only.`;
}

module.exports = {
  buildPrompt
};
