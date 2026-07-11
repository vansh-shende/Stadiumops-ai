/**
 * =========================================================
 *  StadiumOps AI — AI Controller
 * =========================================================
 *
 *  Responsibility:
 *    Handle AI-related HTTP requests.
 *    1. GET /api/test-ai — Verifies Gemini API connectivity.
 *    2. POST /api/alerts — Converts operational anomalies into tactical directives.
 */

const { generateText } = require("../services/geminiService");
const { buildPrompt } = require("../prompts/promptBuilder");
const { generateFallbackDirectives } = require("../services/ruleEngineService");
const logger = require("../utils/logger");

/**
 * GET /api/test-ai
 * Sends a fixed prompt to Gemini and returns the response
 * to confirm the integration is working.
 */
async function testAI(_req, res) {
  try {
    const prompt = "Reply with exactly:\nGemini Connected Successfully";
    const response = await generateText(prompt);

    res.status(200).json({
      success: true,
      provider: "Google Gemini",
      response,
    });
  } catch (err) {
    logger.error("AI", "testAI failed:", err.message);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}

/**
 * POST /api/alerts
 * Receives anomaly JSON, generates a tactical prompt, gets Gemini directives, and returns them.
 */
async function getAlerts(req, res) {
  try {
    const anomalyData = req.body;

    // Check if there are no anomalies
    const anomalies = anomalyData && Array.isArray(anomalyData.anomalies) ? anomalyData.anomalies : [];
    if (anomalies.length === 0) {
      return res.status(200).json({
        success: true,
        alerts: ["[INFO] Stadium operations are normal."]
      });
    }

    // Build the instruction prompt using the rule engine report
    const prompt = buildPrompt(anomalyData);

    let alerts;
    try {
      // Fetch directives from Gemini
      const rawResponse = await generateText(prompt);

      // Clean and split the response line by line
      alerts = rawResponse
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    } catch (apiErr) {
      logger.warn("AIController", `Gemini API failed for getAlerts, falling back to rule-based directives: ${apiErr.message}`);
      alerts = generateFallbackDirectives(anomalyData);
    }

    res.status(200).json({
      success: true,
      alerts
    });
  } catch (err) {
    logger.error("AI", "getAlerts failed:", err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}

// --------------- Exports ---------------

module.exports = {
  testAI,
  getAlerts
};
