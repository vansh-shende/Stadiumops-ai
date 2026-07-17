/**
 * =========================================================
 *  StadiumOps AI — Global Error Handler Middleware
 * =========================================================
 *
 *  Responsibility:
 *    Catch all unhandled errors in Express route handlers and
 *    return a safe, sanitised JSON response.  Internal error
 *    details are logged server-side but NEVER leaked to the
 *    client — a critical security requirement.
 *
 *  Usage:
 *    // Mount AFTER all routes in server.js:
 *    app.use(errorHandler);
 */

const logger = require("../utils/logger");

/**
 * Express error-handling middleware (4 arguments required).
 *
 * @param {Error}    err  - The thrown or forwarded error.
 * @param {Request}  req  - Express request object.
 * @param {Response} res  - Express response object.
 * @param {Function} next - Express next function (unused but required).
 */
function errorHandler(err, _req, res, _next) {
  // Log the full error server-side for debugging.
  logger.error("ErrorHandler", err.stack || err.message);

  // Determine HTTP status code.
  const statusCode = err.statusCode || 500;

  // Never expose internal error messages to the client.
  const clientMessage =
    statusCode === 400
      ? err.message // Validation errors are safe to surface.
      : "An internal server error occurred. Please try again later.";

  res.status(statusCode).json({
    success: false,
    error: clientMessage,
  });
}

module.exports = errorHandler;
