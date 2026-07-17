/**
 * =========================================================
 *  StadiumOps AI — Request Validation Middleware
 * =========================================================
 *
 *  Responsibility:
 *    Centralised input validation and sanitisation using
 *    express-validator.  Provides reusable validation chains
 *    for each endpoint that accepts user input.
 *
 *  Security benefits:
 *    - Prevents SQL injection by whitelisting allowed values.
 *    - Prevents XSS by stripping/escaping user-supplied strings.
 *    - Ensures only expected data types reach business logic.
 */

const { body, validationResult } = require("express-validator");

// --------------- Allowed Values ---------------

/** Whitelisted gate action types. */
const ALLOWED_GATE_ACTIONS = ["open_auxiliary", "deploy_stewards", "toggle_lockdown"];

// --------------- Validation Chains ---------------

/**
 * Validation rules for POST /api/gates/action.
 */
const gateActionRules = [
  body("gateName")
    .exists({ checkFalsy: true }).withMessage("gateName is required.")
    .isString().withMessage("gateName must be a string.")
    .trim()
    .escape()
    .isLength({ min: 1, max: 100 }).withMessage("gateName must be 1-100 characters."),

  body("action")
    .exists({ checkFalsy: true }).withMessage("action is required.")
    .isString().withMessage("action must be a string.")
    .trim()
    .isIn(ALLOWED_GATE_ACTIONS)
    .withMessage(`action must be one of: ${ALLOWED_GATE_ACTIONS.join(", ")}.`),
];

/**
 * Validation rules for POST /api/alerts.
 */
const alertsRules = [
  body("anomalies")
    .optional()
    .isArray().withMessage("anomalies must be an array."),

  body("anomalies.*.type")
    .optional()
    .isString().withMessage("anomaly type must be a string.")
    .trim()
    .escape(),

  body("anomalies.*.severity")
    .optional()
    .isString().withMessage("anomaly severity must be a string.")
    .isIn(["LOW", "MEDIUM", "HIGH"]).withMessage("severity must be LOW, MEDIUM, or HIGH."),

  body("anomalies.*.location")
    .optional()
    .isString().withMessage("anomaly location must be a string.")
    .trim()
    .escape(),

  body("anomalies.*.message")
    .optional()
    .isString().withMessage("anomaly message must be a string.")
    .trim()
    .escape(),

  body("anomalies.*.recommendation")
    .optional()
    .isString().withMessage("anomaly recommendation must be a string.")
    .trim()
    .escape(),
];

// --------------- Result Handler ---------------

/**
 * Middleware that checks validation results and returns
 * a 400 response if any validation errors were found.
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }

  next();
}

// --------------- Exports ---------------

module.exports = {
  gateActionRules,
  alertsRules,
  handleValidationErrors,
};
