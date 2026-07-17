/**
 * =========================================================
 *  StadiumOps AI — Input Validation Middleware Tests
 * =========================================================
 *
 *  Validates the express-validator rules for request
 *  sanitisation and input validation security.
 */

const { gateActionRules, alertsRules, handleValidationErrors } = require("../middleware/validateRequest");

describe("Validation Middleware — Exports", () => {
  test("gateActionRules should be an array of validation chains", () => {
    expect(Array.isArray(gateActionRules)).toBe(true);
    expect(gateActionRules.length).toBeGreaterThan(0);
  });

  test("alertsRules should be an array of validation chains", () => {
    expect(Array.isArray(alertsRules)).toBe(true);
    expect(alertsRules.length).toBeGreaterThan(0);
  });

  test("handleValidationErrors should be a function", () => {
    expect(typeof handleValidationErrors).toBe("function");
  });
});

describe("Validation Middleware — Gate Action Rules", () => {
  test("should have exactly 2 rules (gateName and action)", () => {
    expect(gateActionRules.length).toBe(2);
  });
});

describe("Validation Middleware — Alert Rules", () => {
  test("should have validation rules for anomaly fields", () => {
    expect(alertsRules.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Error Handler Middleware", () => {
  const errorHandler = require("../middleware/errorHandler");

  test("should be a function with 4 parameters (Express error handler)", () => {
    expect(typeof errorHandler).toBe("function");
    // Express error handlers have 4 parameters: (err, req, res, next)
    expect(errorHandler.length).toBe(4);
  });

  test("should return 500 with sanitised message for server errors", () => {
    const mockRes = {
      statusCode: null,
      body: null,
      status(code) { this.statusCode = code; return this; },
      json(data) { this.body = data; return this; }
    };

    const testError = new Error("Sensitive database connection string leaked!");
    errorHandler(testError, {}, mockRes, () => {});

    expect(mockRes.statusCode).toBe(500);
    expect(mockRes.body.success).toBe(false);
    // Verify the internal message is NOT exposed
    expect(mockRes.body.error).not.toContain("database connection string");
    expect(mockRes.body.error).toContain("internal server error");
  });

  test("should return 400 with the actual message for validation errors", () => {
    const mockRes = {
      statusCode: null,
      body: null,
      status(code) { this.statusCode = code; return this; },
      json(data) { this.body = data; return this; }
    };

    const validationError = new Error("gateName is required.");
    validationError.statusCode = 400;
    errorHandler(validationError, {}, mockRes, () => {});

    expect(mockRes.statusCode).toBe(400);
    expect(mockRes.body.error).toBe("gateName is required.");
  });
});
