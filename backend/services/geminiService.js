/**
 * =========================================================
 *  StadiumOps AI — Gemini Service
 * =========================================================
 *
 *  Responsibility:
 *    Initialise the Google Gemini client once and expose a
 *    reusable `generateText(prompt)` function that any
 *    controller or service can call.
 *
 *  Key design decisions:
 *    - The client is lazily initialised on first use (singleton).
 *    - The API key is read from process.env and never exposed.
 *    - All Gemini SDK errors are caught and re-thrown with
 *      a clean message so callers don't need SDK knowledge.
 *
 *  Usage:
 *    const { generateText } = require("../services/geminiService");
 *    const text = await generateText("Summarise today's gate data.");
 */

const { GoogleGenAI } = require("@google/genai");
const logger = require("../utils/logger");

// --------------- Singleton Client ---------------

/** Module-level reference — initialised once via getClient(). */
let client = null;

/**
 * Returns the Gemini client, creating it on the first call.
 * Throws if GEMINI_API_KEY is missing from the environment.
 */
function getClient() {
  if (client) return client;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in the environment variables.");
  }

  client = new GoogleGenAI({ apiKey });
  logger.info("Gemini", "Client initialised successfully.");
  return client;
}

// --------------- Public API ---------------

/**
 * Send a text prompt to Gemini and return the generated text.
 *
 * @param {string} prompt - The text prompt to send.
 * @returns {Promise<string>} The model's plain-text response.
 * @throws {Error} If the API call fails or the key is missing.
 */
async function generateText(prompt) {
  try {
    const ai = getClient();

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    // Extract the text from the response.
    return response.text;
  } catch (err) {
    logger.error("Gemini", "generateText failed:", err.message);
    throw new Error(`Gemini API error: ${err.message}`);
  }
}

// --------------- Exports ---------------

module.exports = { generateText };
