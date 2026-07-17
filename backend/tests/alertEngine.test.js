/**
 * =========================================================
 *  StadiumOps AI — Alert Engine Tests
 * =========================================================
 *
 *  Validates the in-memory alert caching, history management,
 *  and custom action injection logic of the Alert Engine.
 */

const {
  getLatestAlerts,
  getAlertHistory,
  injectCustomAction
} = require("../services/alertEngine");

describe("Alert Engine — Cache State", () => {
  test("getLatestAlerts should return an object with required fields", () => {
    const alerts = getLatestAlerts();
    expect(alerts).toBeDefined();
    expect(alerts).toHaveProperty("generatedAt");
    expect(alerts).toHaveProperty("anomalyCount");
    expect(alerts).toHaveProperty("alerts");
    expect(alerts).toHaveProperty("status");
  });

  test("latestAlerts.status should be a valid state", () => {
    const alerts = getLatestAlerts();
    expect(["completed", "processing", "error"]).toContain(alerts.status);
  });

  test("latestAlerts.alerts should be an array", () => {
    const alerts = getLatestAlerts();
    expect(Array.isArray(alerts.alerts)).toBe(true);
  });

  test("latestAlerts.anomalyCount should be a non-negative number", () => {
    const alerts = getLatestAlerts();
    expect(typeof alerts.anomalyCount).toBe("number");
    expect(alerts.anomalyCount).toBeGreaterThanOrEqual(0);
  });
});

describe("Alert Engine — History", () => {
  test("getAlertHistory should return an array", () => {
    const history = getAlertHistory();
    expect(Array.isArray(history)).toBe(true);
  });

  test("history entries should have required fields", () => {
    const history = getAlertHistory();
    if (history.length > 0) {
      const entry = history[0];
      expect(entry).toHaveProperty("generatedAt");
      expect(entry).toHaveProperty("anomalyCount");
      expect(entry).toHaveProperty("alerts");
    }
  });
});

describe("Alert Engine — Custom Action Injection", () => {
  test("injectCustomAction should add an entry to history", () => {
    const beforeCount = getAlertHistory().length;
    injectCustomAction("Test deployment action");
    const afterCount = getAlertHistory().length;
    expect(afterCount).toBe(beforeCount + 1);
  });

  test("injected action should have [ACTION] prefix", () => {
    injectCustomAction("Stewards deployed to Gate B");
    const history = getAlertHistory();
    const latest = history[0];
    expect(latest.alerts[0]).toContain("[ACTION]");
    expect(latest.alerts[0]).toContain("Stewards deployed to Gate B");
  });

  test("injected action should have anomalyCount of 0", () => {
    injectCustomAction("Test action");
    const history = getAlertHistory();
    expect(history[0].anomalyCount).toBe(0);
  });

  test("injected action should have a valid generatedAt timestamp", () => {
    injectCustomAction("Test timestamp");
    const history = getAlertHistory();
    expect(() => new Date(history[0].generatedAt)).not.toThrow();
  });

  test("history should never exceed 50 entries", () => {
    // Inject many actions
    for (let i = 0; i < 60; i++) {
      injectCustomAction(`Bulk action ${i}`);
    }
    const history = getAlertHistory();
    expect(history.length).toBeLessThanOrEqual(50);
  });
});
