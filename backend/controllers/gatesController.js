/**
 * =========================================================
 *  StadiumOps AI — Gates Controller
 * =========================================================
 *
 *  Responsibility:
 *    Contains the business logic for the Gate_Traffic resource.
 *    Called by routes/gates.js — the route layer stays thin.
 */

const { dbAll, dbGet, dbRun } = require("../config/database");
const logger = require("../utils/logger");
const { injectCustomAction } = require("../services/alertEngine");

/**
 * GET /api/gates
 * Returns all Gate_Traffic records ordered by updated_at DESC.
 */
async function getAllGates(_req, res) {
  try {
    const gates = await dbAll(
      "SELECT * FROM Gate_Traffic ORDER BY updated_at DESC"
    );

    res.status(200).json({
      success: true,
      count: gates.length,
      data: gates,
    });
  } catch (err) {
    logger.error("API", "Error fetching gate traffic:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve gate traffic data.",
    });
  }
}

/**
 * POST /api/gates/action
 * Triggers a manual gate operational command (turnstiles, stewards, lockdown).
 */
async function handleGateAction(req, res) {
  const { gateName, action } = req.body;
  if (!gateName || !action) {
    return res.status(400).json({
      success: false,
      error: "Missing gateName or action in request body."
    });
  }

  try {
    const gate = await dbGet("SELECT * FROM Gate_Traffic WHERE gate_name = ?", [gateName]);
    if (!gate) {
      return res.status(404).json({
        success: false,
        error: `Gate "${gateName}" not found.`
      });
    }

    let newDensity = gate.crowd_density;
    let newWaitTime = gate.wait_time;
    let logMessage = "";

    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);

    if (action === "open_auxiliary") {
      newDensity = Math.max(10, gate.crowd_density - 25);
      newWaitTime = Math.max(1, gate.wait_time - 8);
      logMessage = `Auxiliary turnstiles opened at ${gateName}. Wait: ${gate.wait_time}m -> ${newWaitTime}m, Density: ${gate.crowd_density}% -> ${newDensity}%`;
    } else if (action === "deploy_stewards") {
      newDensity = Math.max(10, gate.crowd_density - 15);
      newWaitTime = Math.max(1, gate.wait_time - 5);
      logMessage = `Stewards deployed to ${gateName}. Density: ${gate.crowd_density}% -> ${newDensity}%, Wait: ${gate.wait_time}m -> ${newWaitTime}m`;
    } else if (action === "toggle_lockdown") {
      if (gate.wait_time === 99) {
        // Lift lockdown
        newDensity = 35;
        newWaitTime = 6;
        logMessage = `Lockdown lifted at ${gateName}. Entries resumed.`;
      } else {
        // Trigger lockdown
        newDensity = 100;
        newWaitTime = 99;
        logMessage = `EMERGENCY LOCKDOWN activated at ${gateName}. Security gates sealed.`;
      }
    } else {
      return res.status(400).json({
        success: false,
        error: `Action "${action}" is not supported.`
      });
    }

    // Update database
    await dbRun(
      "UPDATE Gate_Traffic SET crowd_density = ?, wait_time = ?, updated_at = ? WHERE gate_name = ?",
      [newDensity, newWaitTime, timestamp, gateName]
    );

    // Inject timeline event log
    injectCustomAction(logMessage);

    logger.info("API", `Executed manual operational command: ${logMessage}`);

    res.status(200).json({
      success: true,
      message: logMessage,
      data: {
        gate_name: gateName,
        crowd_density: newDensity,
        wait_time: newWaitTime,
        updated_at: timestamp
      }
    });
  } catch (err) {
    logger.error("API", `Error executing gate action: ${err.message}`);
    res.status(500).json({
      success: false,
      error: `Failed to execute gate action: ${err.message}`
    });
  }
}

// --------------- Exports ---------------

module.exports = {
  getAllGates,
  handleGateAction
};
