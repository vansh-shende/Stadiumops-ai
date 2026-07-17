/**
 * =========================================================
 *  StadiumOps AI — API Controller Tests
 * =========================================================
 *
 *  Validates the request/response behavior of all Express
 *  controllers including success paths, error handling,
 *  edge cases, and input validation.
 */

const { detectAnomalies, generateFallbackDirectives } = require("../services/ruleEngineService");

// ────────────────────────────────────────────────
//  1. detectAnomalies — Input Validation Edge Cases
// ────────────────────────────────────────────────

describe("detectAnomalies — input validation", () => {
  test("should throw on null input", () => {
    expect(() => detectAnomalies(null)).toThrow("Invalid stadium snapshot provided.");
  });

  test("should throw on undefined input", () => {
    expect(() => detectAnomalies(undefined)).toThrow("Invalid stadium snapshot provided.");
  });

  test("should handle empty arrays gracefully (no anomalies)", () => {
    const result = detectAnomalies({ gateTraffic: [], inventory: [], staff: [] });
    expect(result.anomalyCount).toBe(0);
    expect(result.anomalies).toEqual([]);
    expect(result.generatedAt).toBeDefined();
  });

  test("should handle missing array keys with defaults", () => {
    const result = detectAnomalies({});
    expect(result.anomalyCount).toBe(0);
    expect(result.anomalies).toEqual([]);
  });

  test("should handle snapshot with only gateTraffic (inventory/staff missing)", () => {
    const result = detectAnomalies({
      gateTraffic: [
        { id: 1, gate_name: "Gate A", crowd_density: 30, wait_time: 5 }
      ]
    });
    expect(result.anomalyCount).toBe(0);
  });
});

// ────────────────────────────────────────────────
//  2. detectAnomalies — Gate Traffic Rules
// ────────────────────────────────────────────────

describe("detectAnomalies — gate traffic rules", () => {
  test("should NOT flag gate with wait_time exactly at threshold (15)", () => {
    const result = detectAnomalies({
      gateTraffic: [
        { id: 1, gate_name: "Gate A", crowd_density: 50, wait_time: 15 }
      ],
      inventory: [],
      staff: []
    });
    // Threshold is > 15, so exactly 15 should NOT trigger
    const waitAnomalies = result.anomalies.filter(a => a.type === "HIGH_WAIT_TIME");
    expect(waitAnomalies.length).toBe(0);
  });

  test("should flag gate with wait_time > 15 as HIGH_WAIT_TIME (MEDIUM severity)", () => {
    const result = detectAnomalies({
      gateTraffic: [
        { id: 1, gate_name: "Gate B - North", crowd_density: 40, wait_time: 16 }
      ],
      inventory: [],
      staff: []
    });
    expect(result.anomalyCount).toBe(1);
    expect(result.anomalies[0].type).toBe("HIGH_WAIT_TIME");
    expect(result.anomalies[0].severity).toBe("MEDIUM");
    expect(result.anomalies[0].location).toBe("Gate B - North");
  });

  test("should NOT flag gate with crowd_density exactly at threshold (85)", () => {
    const result = detectAnomalies({
      gateTraffic: [
        { id: 1, gate_name: "Gate C", crowd_density: 85, wait_time: 5 }
      ],
      inventory: [],
      staff: []
    });
    const congestionAnomalies = result.anomalies.filter(a => a.type === "CROWD_CONGESTION");
    expect(congestionAnomalies.length).toBe(0);
  });

  test("should flag gate with crowd_density > 85 as CROWD_CONGESTION (HIGH severity)", () => {
    const result = detectAnomalies({
      gateTraffic: [
        { id: 1, gate_name: "Gate D", crowd_density: 90, wait_time: 5 }
      ],
      inventory: [],
      staff: []
    });
    expect(result.anomalyCount).toBe(1);
    expect(result.anomalies[0].type).toBe("CROWD_CONGESTION");
    expect(result.anomalies[0].severity).toBe("HIGH");
  });

  test("should detect BOTH anomalies on same gate (high density AND wait)", () => {
    const result = detectAnomalies({
      gateTraffic: [
        { id: 1, gate_name: "Gate A", crowd_density: 95, wait_time: 25 }
      ],
      inventory: [],
      staff: []
    });
    expect(result.anomalyCount).toBe(2);
    const types = result.anomalies.map(a => a.type);
    expect(types).toContain("HIGH_WAIT_TIME");
    expect(types).toContain("CROWD_CONGESTION");
  });
});

// ────────────────────────────────────────────────
//  3. detectAnomalies — Inventory Rules
// ────────────────────────────────────────────────

describe("detectAnomalies — inventory rules", () => {
  test("should NOT flag item with quantity exactly at threshold (20)", () => {
    const result = detectAnomalies({
      gateTraffic: [],
      inventory: [
        { id: 1, stand_name: "Burger Barn", item_name: "Cheeseburger", quantity: 20 }
      ],
      staff: []
    });
    const lowStockAnomalies = result.anomalies.filter(a => a.type === "LOW_STOCK");
    expect(lowStockAnomalies.length).toBe(0);
  });

  test("should flag item with quantity < 20 as LOW_STOCK (LOW severity)", () => {
    const result = detectAnomalies({
      gateTraffic: [],
      inventory: [
        { id: 1, stand_name: "Pizza Corner", item_name: "Pepperoni", quantity: 5 }
      ],
      staff: []
    });
    expect(result.anomalyCount).toBe(1);
    expect(result.anomalies[0].type).toBe("LOW_STOCK");
    expect(result.anomalies[0].severity).toBe("LOW");
    expect(result.anomalies[0].location).toBe("Pizza Corner (Pepperoni)");
  });

  test("should flag item with quantity 0", () => {
    const result = detectAnomalies({
      gateTraffic: [],
      inventory: [
        { id: 1, stand_name: "Drinks Station", item_name: "Soda", quantity: 0 }
      ],
      staff: []
    });
    expect(result.anomalyCount).toBe(1);
    expect(result.anomalies[0].type).toBe("LOW_STOCK");
  });

  test("should flag multiple low-stock items independently", () => {
    const result = detectAnomalies({
      gateTraffic: [],
      inventory: [
        { id: 1, stand_name: "Burger Barn", item_name: "Burger", quantity: 10 },
        { id: 2, stand_name: "Pizza Corner", item_name: "Pizza", quantity: 5 },
        { id: 3, stand_name: "Drinks Station", item_name: "Water", quantity: 200 }
      ],
      staff: []
    });
    expect(result.anomalyCount).toBe(2);
    expect(result.anomalies.every(a => a.type === "LOW_STOCK")).toBe(true);
  });
});

// ────────────────────────────────────────────────
//  4. detectAnomalies — Staff Shortage Rules
// ────────────────────────────────────────────────

describe("detectAnomalies — staff shortage rules", () => {
  test("should NOT flag zone with 2+ available staff", () => {
    const result = detectAnomalies({
      gateTraffic: [],
      inventory: [],
      staff: [
        { id: 1, staff_name: "Alice", zone: "Gate A", status: "Available" },
        { id: 2, staff_name: "Bob", zone: "Gate A", status: "Available" }
      ]
    });
    expect(result.anomalyCount).toBe(0);
  });

  test("should flag zone with only 1 available staff (MEDIUM severity)", () => {
    const result = detectAnomalies({
      gateTraffic: [],
      inventory: [],
      staff: [
        { id: 1, staff_name: "Alice", zone: "Gate A", status: "Available" },
        { id: 2, staff_name: "Bob", zone: "Gate A", status: "Busy" }
      ]
    });
    expect(result.anomalyCount).toBe(1);
    expect(result.anomalies[0].type).toBe("STAFF_SHORTAGE");
    expect(result.anomalies[0].severity).toBe("MEDIUM");
    expect(result.anomalies[0].location).toBe("Gate A");
  });

  test("should flag zone with 0 available staff (HIGH severity)", () => {
    const result = detectAnomalies({
      gateTraffic: [],
      inventory: [],
      staff: [
        { id: 1, staff_name: "Alice", zone: "VIP Lounge", status: "On Break" },
        { id: 2, staff_name: "Bob", zone: "VIP Lounge", status: "Busy" }
      ]
    });
    expect(result.anomalyCount).toBe(1);
    expect(result.anomalies[0].type).toBe("STAFF_SHORTAGE");
    expect(result.anomalies[0].severity).toBe("HIGH");
  });

  test("should flag multiple zones independently", () => {
    const result = detectAnomalies({
      gateTraffic: [],
      inventory: [],
      staff: [
        { id: 1, staff_name: "Alice", zone: "Gate A", status: "Busy" },
        { id: 2, staff_name: "Bob", zone: "Gate B", status: "On Break" }
      ]
    });
    expect(result.anomalyCount).toBe(2);
    const zones = result.anomalies.map(a => a.location);
    expect(zones).toContain("Gate A");
    expect(zones).toContain("Gate B");
  });
});

// ────────────────────────────────────────────────
//  5. detectAnomalies — Combined Multi-Anomaly Scenarios
// ────────────────────────────────────────────────

describe("detectAnomalies — combined scenarios", () => {
  test("should detect all 4 anomaly types simultaneously", () => {
    const result = detectAnomalies({
      gateTraffic: [
        { id: 1, gate_name: "Gate A", crowd_density: 92, wait_time: 25 }
      ],
      inventory: [
        { id: 1, stand_name: "Hot Dog Haven", item_name: "Hot Dog", quantity: 3 }
      ],
      staff: [
        { id: 1, staff_name: "Staff 1", zone: "Gate A", status: "Busy" }
      ]
    });
    expect(result.anomalyCount).toBe(4);
    const types = result.anomalies.map(a => a.type).sort();
    expect(types).toEqual(["CROWD_CONGESTION", "HIGH_WAIT_TIME", "LOW_STOCK", "STAFF_SHORTAGE"]);
  });

  test("each anomaly should include id, type, severity, location, message, and recommendation", () => {
    const result = detectAnomalies({
      gateTraffic: [
        { id: 1, gate_name: "Gate X", crowd_density: 95, wait_time: 5 }
      ],
      inventory: [],
      staff: []
    });
    const anomaly = result.anomalies[0];
    expect(anomaly.id).toBeDefined();
    expect(anomaly.type).toBeDefined();
    expect(anomaly.severity).toBeDefined();
    expect(anomaly.location).toBeDefined();
    expect(anomaly.message).toBeDefined();
    expect(anomaly.recommendation).toBeDefined();
  });

  test("result should include generatedAt as ISO timestamp", () => {
    const result = detectAnomalies({ gateTraffic: [], inventory: [], staff: [] });
    expect(result.generatedAt).toBeDefined();
    expect(() => new Date(result.generatedAt)).not.toThrow();
  });
});

// ────────────────────────────────────────────────
//  6. generateFallbackDirectives
// ────────────────────────────────────────────────

describe("generateFallbackDirectives", () => {
  test("should return info message when no anomalies exist", () => {
    const result = generateFallbackDirectives({ anomalies: [] });
    expect(result).toEqual(["[INFO] Stadium operations are normal."]);
  });

  test("should return info message when anomalies is null", () => {
    const result = generateFallbackDirectives({ anomalies: null });
    expect(result).toEqual(["[INFO] Stadium operations are normal."]);
  });

  test("should return info message when report is null", () => {
    const result = generateFallbackDirectives(null);
    expect(result).toEqual(["[INFO] Stadium operations are normal."]);
  });

  test("should sort directives by severity: HIGH → MEDIUM → LOW", () => {
    const result = generateFallbackDirectives({
      anomalies: [
        { type: "LOW_STOCK", severity: "LOW", recommendation: "Restock", location: "Stand A" },
        { type: "CROWD_CONGESTION", severity: "HIGH", recommendation: "Open gate", location: "Gate A" },
        { type: "HIGH_WAIT_TIME", severity: "MEDIUM", recommendation: "Redirect", location: "Gate B" }
      ]
    });
    expect(result.length).toBe(3);
    expect(result[0]).toContain("[CRITICAL]");
    expect(result[1]).toContain("[WARNING]");
    expect(result[2]).toContain("[INFO]");
  });

  test("should limit to maximum 5 directives", () => {
    const manyAnomalies = Array.from({ length: 10 }, (_, i) => ({
      type: "CROWD_CONGESTION",
      severity: "HIGH",
      recommendation: `Action ${i}`,
      location: `Gate ${i}`
    }));

    const result = generateFallbackDirectives({ anomalies: manyAnomalies });
    expect(result.length).toBeLessThanOrEqual(5);
  });

  test("each directive should end with a period", () => {
    const result = generateFallbackDirectives({
      anomalies: [
        { type: "STAFF_SHORTAGE", severity: "MEDIUM", recommendation: "Deploy staff", location: "Gate A" }
      ]
    });
    result.forEach(directive => {
      expect(directive.endsWith(".")).toBe(true);
    });
  });

  test("should produce customized STAFF_SHORTAGE directive", () => {
    const result = generateFallbackDirectives({
      anomalies: [
        { type: "STAFF_SHORTAGE", severity: "MEDIUM", recommendation: "Deploy", location: "East Wing" }
      ]
    });
    expect(result[0]).toContain("East Wing");
    expect(result[0]).toContain("Deploy additional staff");
  });

  test("should produce customized LOW_STOCK directive", () => {
    const result = generateFallbackDirectives({
      anomalies: [
        { type: "LOW_STOCK", severity: "LOW", recommendation: "Restock", location: "Hot Dog Haven (Classic Hot Dog)" }
      ]
    });
    expect(result[0]).toContain("Hot Dog Haven");
    expect(result[0]).toContain("[INFO]");
  });
});
