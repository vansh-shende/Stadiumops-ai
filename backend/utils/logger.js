/**
 * =========================================================
 *  StadiumOps AI — Logger Utility
 * =========================================================
 *
 *  Responsibility:
 *    Centralised, consistent logging across the entire application.
 *    Provides info, warn, and error methods with timestamps and
 *    colour-coded prefixes for easy terminal scanning.
 *
 *  Usage:
 *    const logger = require("../utils/logger");
 *    logger.info("Server started");
 *    logger.warn("Disk usage high");
 *    logger.error("Connection lost", err.message);
 */

// --------------- Formatting ---------------

/**
 * Returns an ISO-style timestamp truncated to seconds.
 * Example: "2026-07-08 17:30:45"
 */
function timestamp() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

// --------------- Public API ---------------

/**
 * Log an informational message.
 * @param {string} tag     - Module or context label (e.g. "DB", "API").
 * @param  {...any} args   - Values to log.
 */
function info(tag, ...args) {
  console.log(`[${timestamp()}] [INFO]  [${tag}]`, ...args);
}

/**
 * Log a warning message.
 * @param {string} tag     - Module or context label.
 * @param  {...any} args   - Values to log.
 */
function warn(tag, ...args) {
  console.warn(`[${timestamp()}] [WARN]  [${tag}]`, ...args);
}

/**
 * Log an error message.
 * @param {string} tag     - Module or context label.
 * @param  {...any} args   - Values to log.
 */
function error(tag, ...args) {
  console.error(`[${timestamp()}] [ERROR] [${tag}]`, ...args);
}

// --------------- Exports ---------------

module.exports = { info, warn, error };
