const { detectAnomalies, generateFallbackDirectives } = require("../services/ruleEngineService");

describe("StadiumOps AI Rule Engine Service", () => {
  describe("detectAnomalies", () => {
    test("should throw an error if snapshot is invalid or missing", () => {
      expect(() => detectAnomalies(null)).toThrow("Invalid stadium snapshot provided.");
      expect(() => detectAnomalies(undefined)).toThrow("Invalid stadium snapshot provided.");
    });

    test("should detect zero anomalies in a normal stadium snapshot", () => {
      const mockNormalSnapshot = {
        gateTraffic: [
          { id: 1, gate_name: "Gate A - Main Entrance", crowd_density: 30, wait_time: 5 },
          { id: 2, gate_name: "Gate B - North Stand", crowd_density: 45, wait_time: 10 }
        ],
        inventory: [
          { id: 1, stand_name: "Hot Dog Haven", item_name: "Classic Hot Dog", quantity: 50 },
          { id: 2, stand_name: "Pizza Corner", item_name: "Pepperoni Slice", quantity: 120 }
        ],
        staff: [
          { id: 1, staff_name: "Staff 1", zone: "Gate A", status: "Available" },
          { id: 2, staff_name: "Staff 2", zone: "Gate A", status: "Available" },
          { id: 3, staff_name: "Staff 3", zone: "Gate B", status: "Available" },
          { id: 4, staff_name: "Staff 4", zone: "Gate B", status: "Available" }
        ]
      };

      const result = detectAnomalies(mockNormalSnapshot);
      expect(result.anomalyCount).toBe(0);
      expect(result.anomalies.length).toBe(0);
      expect(result.generatedAt).toBeDefined();
    });

    test("should detect HIGH_WAIT_TIME anomaly when wait time > 15 minutes", () => {
      const mockSnapshot = {
        gateTraffic: [
          { id: 1, gate_name: "Gate A - Main Entrance", crowd_density: 40, wait_time: 20 }
        ],
        inventory: [],
        staff: [
          { id: 1, staff_name: "Staff 1", zone: "Gate A", status: "Available" },
          { id: 2, staff_name: "Staff 2", zone: "Gate A", status: "Available" }
        ]
      };

      const result = detectAnomalies(mockSnapshot);
      expect(result.anomalyCount).toBe(1);
      expect(result.anomalies[0].type).toBe("HIGH_WAIT_TIME");
      expect(result.anomalies[0].severity).toBe("MEDIUM");
      expect(result.anomalies[0].location).toBe("Gate A - Main Entrance");
    });

    test("should detect CROWD_CONGESTION anomaly when density > 85%", () => {
      const mockSnapshot = {
        gateTraffic: [
          { id: 1, gate_name: "Gate A - Main Entrance", crowd_density: 90, wait_time: 10 }
        ],
        inventory: [],
        staff: [
          { id: 1, staff_name: "Staff 1", zone: "Gate A", status: "Available" },
          { id: 2, staff_name: "Staff 2", zone: "Gate A", status: "Available" }
        ]
      };

      const result = detectAnomalies(mockSnapshot);
      expect(result.anomalyCount).toBe(1);
      expect(result.anomalies[0].type).toBe("CROWD_CONGESTION");
      expect(result.anomalies[0].severity).toBe("HIGH");
    });

    test("should detect LOW_STOCK anomaly when item quantity < 20", () => {
      const mockSnapshot = {
        gateTraffic: [],
        inventory: [
          { id: 1, stand_name: "Hot Dog Haven", item_name: "Classic Hot Dog", quantity: 15 }
        ],
        staff: []
      };

      const result = detectAnomalies(mockSnapshot);
      expect(result.anomalyCount).toBe(1);
      expect(result.anomalies[0].type).toBe("LOW_STOCK");
      expect(result.anomalies[0].severity).toBe("LOW");
      expect(result.anomalies[0].location).toBe("Hot Dog Haven (Classic Hot Dog)");
    });

    test("should detect STAFF_SHORTAGE anomaly when available staff < 2", () => {
      const mockSnapshot = {
        gateTraffic: [],
        inventory: [],
        staff: [
          { id: 1, staff_name: "Staff 1", zone: "Gate A", status: "Available" },
          { id: 2, staff_name: "Staff 2", zone: "Gate A", status: "Busy" } // Only 1 is available
        ]
      };

      const result = detectAnomalies(mockSnapshot);
      expect(result.anomalyCount).toBe(1);
      expect(result.anomalies[0].type).toBe("STAFF_SHORTAGE");
      expect(result.anomalies[0].severity).toBe("MEDIUM");
      expect(result.anomalies[0].location).toBe("Gate A");
    });

    test("should set STAFF_SHORTAGE severity to HIGH when available staff is 0", () => {
      const mockSnapshot = {
        gateTraffic: [],
        inventory: [],
        staff: [
          { id: 1, staff_name: "Staff 1", zone: "Gate A", status: "Busy" },
          { id: 2, staff_name: "Staff 2", zone: "Gate A", status: "On Break" } // 0 available
        ]
      };

      const result = detectAnomalies(mockSnapshot);
      expect(result.anomalyCount).toBe(1);
      expect(result.anomalies[0].type).toBe("STAFF_SHORTAGE");
      expect(result.anomalies[0].severity).toBe("HIGH");
    });
  });

  describe("generateFallbackDirectives", () => {
    test("should return info line if no anomalies exist", () => {
      const report = { anomalies: [] };
      const directives = generateFallbackDirectives(report);
      expect(directives).toEqual(["[INFO] Stadium operations are normal."]);
    });

    test("should sort and return directives prioritizing HIGH severity", () => {
      const report = {
        anomalies: [
          { type: "LOW_STOCK", severity: "LOW", recommendation: "Restock Hot Dogs", location: "Hot Dog Haven" },
          { type: "CROWD_CONGESTION", severity: "HIGH", recommendation: "Open Gate A", location: "Gate A" },
          { type: "HIGH_WAIT_TIME", severity: "MEDIUM", recommendation: "Redirect Gate B", location: "Gate B" }
        ]
      };

      const directives = generateFallbackDirectives(report);
      expect(directives.length).toBe(3);
      expect(directives[0]).toContain("[CRITICAL]");
      expect(directives[1]).toContain("[WARNING]");
      expect(directives[2]).toContain("[INFO]");
    });
  });
});
