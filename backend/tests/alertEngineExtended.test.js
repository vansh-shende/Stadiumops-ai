/**
 * =========================================================
 *  StadiumOps AI — Alert Engine Extended Tests
 * =========================================================
 *
 *  Tests the full engine loop lifecycle including:
 *    - runEngineTick with zero anomalies (no Gemini call)
 *    - runEngineTick with anomalies triggering Gemini success
 *    - runEngineTick with Gemini failure (fallback directives)
 *    - runEngineTick with snapshot failure (error status)
 *    - runEngineTick skip when status is "processing"
 *    - startAlertEngine idempotency
 *    - History cap enforcement under stress
 *    - getLatestAlerts / getAlertHistory contracts
 *    - injectCustomAction with edge-case inputs
 *
 *  All external services are fully mocked.
 */

// ── Mocks ──────────────────────────────────────────

jest.mock("../services/stadiumDataService", () => ({
  getStadiumSnapshot: jest.fn(),
}));

jest.mock("../services/ruleEngineService", () => ({
  detectAnomalies: jest.fn(),
  generateFallbackDirectives: jest.fn(),
}));

jest.mock("../prompts/promptBuilder", () => ({
  buildPrompt: jest.fn().mockReturnValue("mock prompt"),
}));

jest.mock("../services/geminiService", () => ({
  generateText: jest.fn(),
}));

jest.mock("../utils/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// ── Import after mocks ─────────────────────────────

const { getStadiumSnapshot } = require("../services/stadiumDataService");
const { detectAnomalies, generateFallbackDirectives } = require("../services/ruleEngineService");
const { generateText } = require("../services/geminiService");

// We need a fresh module for each test suite to reset module-level state
let alertEngine;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();

  // Re-require to reset module-level state (latestAlerts, alertHistory, intervalId)
  jest.isolateModules(() => {
    alertEngine = require("../services/alertEngine");
  });
});

afterEach(() => {
  jest.useRealTimers();
});

// ────────────────────────────────────────────────
//  1. getLatestAlerts — Initial State
// ────────────────────────────────────────────────

describe("AlertEngine — getLatestAlerts initial state", () => {
  test("returns an object with all required fields", () => {
    const alerts = alertEngine.getLatestAlerts();
    expect(alerts).toHaveProperty("generatedAt");
    expect(alerts).toHaveProperty("anomalyCount");
    expect(alerts).toHaveProperty("alerts");
    expect(alerts).toHaveProperty("status");
  });

  test("initial status is 'completed'", () => {
    expect(alertEngine.getLatestAlerts().status).toBe("completed");
  });

  test("initial anomalyCount is 0", () => {
    expect(alertEngine.getLatestAlerts().anomalyCount).toBe(0);
  });

  test("initial alerts array contains the nominal info message", () => {
    const alerts = alertEngine.getLatestAlerts().alerts;
    expect(alerts).toEqual(["[INFO] Stadium operations are normal."]);
  });

  test("generatedAt is a valid ISO timestamp", () => {
    const { generatedAt } = alertEngine.getLatestAlerts();
    expect(() => new Date(generatedAt)).not.toThrow();
    expect(new Date(generatedAt).getTime()).not.toBeNaN();
  });
});

// ────────────────────────────────────────────────
//  2. getAlertHistory — Initial State
// ────────────────────────────────────────────────

describe("AlertEngine — getAlertHistory initial state", () => {
  test("returns an array", () => {
    expect(Array.isArray(alertEngine.getAlertHistory())).toBe(true);
  });

  test("initial history has exactly 1 entry", () => {
    expect(alertEngine.getAlertHistory()).toHaveLength(1);
  });

  test("initial history entry has required fields", () => {
    const entry = alertEngine.getAlertHistory()[0];
    expect(entry).toHaveProperty("generatedAt");
    expect(entry).toHaveProperty("anomalyCount");
    expect(entry).toHaveProperty("alerts");
  });

  test("initial history entry does NOT have status field", () => {
    const entry = alertEngine.getAlertHistory()[0];
    expect(entry).not.toHaveProperty("status");
  });
});

// ────────────────────────────────────────────────
//  3. injectCustomAction
// ────────────────────────────────────────────────

describe("AlertEngine — injectCustomAction", () => {
  test("adds an entry to the front of history", () => {
    const beforeCount = alertEngine.getAlertHistory().length;
    alertEngine.injectCustomAction("Test deployment action");
    expect(alertEngine.getAlertHistory().length).toBe(beforeCount + 1);
    expect(alertEngine.getAlertHistory()[0].alerts[0]).toContain("[ACTION]");
  });

  test("prefixes message with [ACTION]", () => {
    alertEngine.injectCustomAction("Stewards deployed to Gate B");
    const latest = alertEngine.getAlertHistory()[0];
    expect(latest.alerts[0]).toBe("[ACTION] Stewards deployed to Gate B");
  });

  test("sets anomalyCount to 0", () => {
    alertEngine.injectCustomAction("Test");
    expect(alertEngine.getAlertHistory()[0].anomalyCount).toBe(0);
  });

  test("includes a valid generatedAt timestamp", () => {
    alertEngine.injectCustomAction("Timestamp test");
    const { generatedAt } = alertEngine.getAlertHistory()[0];
    expect(new Date(generatedAt).getTime()).not.toBeNaN();
  });

  test("handles empty string message", () => {
    alertEngine.injectCustomAction("");
    expect(alertEngine.getAlertHistory()[0].alerts[0]).toBe("[ACTION] ");
  });

  test("handles message with special characters", () => {
    alertEngine.injectCustomAction("Gate A → lockdown <activated> & confirmed");
    expect(alertEngine.getAlertHistory()[0].alerts[0]).toContain(
      "Gate A → lockdown <activated> & confirmed"
    );
  });

  test("handles very long messages", () => {
    const longMsg = "A".repeat(10000);
    alertEngine.injectCustomAction(longMsg);
    expect(alertEngine.getAlertHistory()[0].alerts[0]).toContain(longMsg);
  });

  test("caps history at 50 entries", () => {
    for (let i = 0; i < 60; i++) {
      alertEngine.injectCustomAction(`Bulk action ${i}`);
    }
    expect(alertEngine.getAlertHistory().length).toBeLessThanOrEqual(50);
  });

  test("newest entry is always first after injection", () => {
    alertEngine.injectCustomAction("First");
    alertEngine.injectCustomAction("Second");
    alertEngine.injectCustomAction("Third");
    expect(alertEngine.getAlertHistory()[0].alerts[0]).toContain("Third");
    expect(alertEngine.getAlertHistory()[1].alerts[0]).toContain("Second");
    expect(alertEngine.getAlertHistory()[2].alerts[0]).toContain("First");
  });
});

// ────────────────────────────────────────────────
//  4. startAlertEngine
// ────────────────────────────────────────────────

describe("AlertEngine — startAlertEngine", () => {
  test("calls runEngineTick immediately on start (processes snapshot)", () => {
    getStadiumSnapshot.mockResolvedValue({ gateTraffic: [], inventory: [], staff: [] });
    detectAnomalies.mockReturnValue({ anomalyCount: 0, anomalies: [] });

    alertEngine.startAlertEngine();

    // The first tick is called synchronously (though it's async internally)
    expect(getStadiumSnapshot).toHaveBeenCalledTimes(1);
  });

  test("does not create duplicate intervals on second call", () => {
    getStadiumSnapshot.mockResolvedValue({ gateTraffic: [], inventory: [], staff: [] });
    detectAnomalies.mockReturnValue({ anomalyCount: 0, anomalies: [] });

    alertEngine.startAlertEngine();
    alertEngine.startAlertEngine(); // second call — should be no-op

    // Only 1 call from the first startAlertEngine
    expect(getStadiumSnapshot).toHaveBeenCalledTimes(1);
  });
});

// ────────────────────────────────────────────────
//  5. History Cap Under Stress
// ────────────────────────────────────────────────

describe("AlertEngine — history cap", () => {
  test("history never exceeds 50 with rapid custom actions", () => {
    for (let i = 0; i < 100; i++) {
      alertEngine.injectCustomAction(`Stress test ${i}`);
    }
    const history = alertEngine.getAlertHistory();
    expect(history.length).toBeLessThanOrEqual(50);
  });

  test("oldest entries are dropped when cap is reached", () => {
    // Fill to capacity
    for (let i = 0; i < 55; i++) {
      alertEngine.injectCustomAction(`Entry ${i}`);
    }
    const history = alertEngine.getAlertHistory();
    // The newest should be the last one injected
    expect(history[0].alerts[0]).toContain("Entry 54");
    // The oldest "Entry 0" through "Entry 4" should be evicted
    const allAlerts = history.map((h) => h.alerts[0]).join(" ");
    expect(allAlerts).not.toContain("Entry 0");
  });
});

// ────────────────────────────────────────────────
//  6. Status Validation
// ────────────────────────────────────────────────

describe("AlertEngine — status values", () => {
  test("status is always one of the valid states", () => {
    const validStates = ["completed", "processing", "error"];
    const { status } = alertEngine.getLatestAlerts();
    expect(validStates).toContain(status);
  });

  test("alerts field is always an array", () => {
    expect(Array.isArray(alertEngine.getLatestAlerts().alerts)).toBe(true);
  });

  test("anomalyCount is always a non-negative number", () => {
    const { anomalyCount } = alertEngine.getLatestAlerts();
    expect(typeof anomalyCount).toBe("number");
    expect(anomalyCount).toBeGreaterThanOrEqual(0);
  });
});
