/**
 * =========================================================
 *  StadiumOps AI — Anomaly Detection Rule Engine Service
 * =========================================================
 *
 *  Responsibility:
 *    Analyze a stadium data snapshot and detect operational anomalies
 *    based on predefined static rules:
 *      1. Gate Traffic:
 *         - Wait time > 15 minutes -> HIGH_WAIT_TIME (Severity: MEDIUM)
 *         - Crowd density > 85% -> CROWD_CONGESTION (Severity: HIGH)
 *      2. Inventory:
 *         - Quantity < 20 -> LOW_STOCK (Severity: LOW)
 *      3. Staff Logistics:
 *         - Available staff count in any zone < 2 -> STAFF_SHORTAGE (Severity: HIGH/MEDIUM)
 *
 *  This engine runs purely on deterministic business rules without any AI.
 */

const logger = require("../utils/logger");

/**
 * Analyze the stadium data snapshot and return all detected anomalies.
 *
 * @param {Object} snapshot - The output object from getStadiumSnapshot()
 * @returns {Object} Anomaly report containing generatedAt, anomalyCount, and anomalies list.
 */
function detectAnomalies(snapshot) {
  try {
    const anomalies = [];

    if (!snapshot) {
      throw new Error("Invalid stadium snapshot provided.");
    }

    const { gateTraffic = [], inventory = [], staff = [] } = snapshot;

    // 1. Analyze Gate Traffic
    gateTraffic.forEach((gate) => {
      // Rule: wait_time > 15
      if (gate.wait_time > 15) {
        anomalies.push({
          id: `gate-wait-${gate.id}`,
          type: "HIGH_WAIT_TIME",
          severity: "MEDIUM",
          location: gate.gate_name,
          message: `High wait time of ${gate.wait_time} minutes detected at ${gate.gate_name}.`,
          recommendation: "Open overflow gate or redirect incoming traffic."
        });
      }

      // Rule: crowd_density > 85
      if (gate.crowd_density > 85) {
        anomalies.push({
          id: `gate-congestion-${gate.id}`,
          type: "CROWD_CONGESTION",
          severity: "HIGH",
          location: gate.gate_name,
          message: `Extreme crowd congestion of ${gate.crowd_density}% detected at ${gate.gate_name}.`,
          recommendation: "Open overflow gate immediately and redirect traffic."
        });
      }
    });

    // 2. Analyze Concession Inventory
    inventory.forEach((item) => {
      // Rule: quantity < 20
      if (item.quantity < 20) {
        anomalies.push({
          id: `inventory-low-${item.id}`,
          type: "LOW_STOCK",
          severity: "LOW",
          location: `${item.stand_name} (${item.item_name})`,
          message: `Low stock alert for ${item.item_name} at ${item.stand_name} (Only ${item.quantity} items left).`,
          recommendation: "Restock inventory immediately."
        });
      }
    });

    // 3. Analyze Staff Logistics
    // Group staff by zone and count available staff members (status === 'Available')
    const staffByZone = {};

    staff.forEach((member) => {
      const zone = member.zone;
      if (!staffByZone[zone]) {
        staffByZone[zone] = 0;
      }
      if (member.status === "Available") {
        staffByZone[zone]++;
      }
    });

    // Rule: available staff in any zone is less than 2
    Object.entries(staffByZone).forEach(([zone, availableCount]) => {
      if (availableCount < 2) {
        anomalies.push({
          id: `staff-shortage-${zone.replace(/\s+/g, "-").toLowerCase()}`,
          type: "STAFF_SHORTAGE",
          severity: availableCount === 0 ? "HIGH" : "MEDIUM",
          location: zone,
          message: `Staff shortage in ${zone}. Only ${availableCount} available staff member(s) present.`,
          recommendation: "Deploy additional staff or reassign staff from less busy zones."
        });
      }
    });

    return {
      generatedAt: new Date().toISOString(),
      anomalyCount: anomalies.length,
      anomalies
    };
  } catch (err) {
    logger.error("RuleEngine", "Error detecting anomalies:", err.message);
    throw err;
  }
}

/**
 * Generate fallback tactical directives based on anomalies when Gemini is offline.
 *
 * @param {Object} anomalyReport - Anomaly report containing anomalies list.
 * @returns {Array<string>} List of directives.
 */
function generateFallbackDirectives(anomalyReport) {
  const anomalies = anomalyReport && Array.isArray(anomalyReport.anomalies) ? anomalyReport.anomalies : [];
  if (anomalies.length === 0) {
    return ["[INFO] Stadium operations are normal."];
  }

  // Sort anomalies by severity: HIGH first, then MEDIUM, then LOW
  const severityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
  const sortedAnomalies = [...anomalies].sort((a, b) => {
    return (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3);
  });

  const directives = [];
  for (const anomaly of sortedAnomalies) {
    if (directives.length >= 5) break;

    let prefix = "[INFO]";
    if (anomaly.severity === "HIGH") {
      prefix = "[CRITICAL]";
    } else if (anomaly.severity === "MEDIUM") {
      prefix = "[WARNING]";
    }

    let action = anomaly.recommendation || anomaly.message;
    
    // Customize directives based on anomaly type to make them clean, actionable sentences
    if (anomaly.type === "STAFF_SHORTAGE") {
      action = `Deploy additional staff or reassign staff from less busy zones to ${anomaly.location}`;
    } else if (anomaly.type === "HIGH_WAIT_TIME" || anomaly.type === "CROWD_CONGESTION") {
      action = `Open overflow gates or redirect incoming traffic at ${anomaly.location}`;
    } else if (anomaly.type === "LOW_STOCK") {
      action = `Restock inventory immediately for ${anomaly.location}`;
    }

    if (!action.endsWith(".")) {
      action += ".";
    }

    directives.push(`${prefix} ${action}`);
  }

  return directives;
}

module.exports = {
  detectAnomalies,
  generateFallbackDirectives
};
