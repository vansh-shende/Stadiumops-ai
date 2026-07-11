/**
 * =========================================================
 *  StadiumOps AI — Live Data Simulator
 * =========================================================
 *
 *  Responsibility:
 *    Standalone process that mutates database rows every 10
 *    seconds to simulate real-time stadium activity.
 *
 *  What changes on each tick:
 *    • Gate_Traffic         → crowd_density (10–100), wait_time (1–30)
 *    • Concession_Inventory → quantity (0–200)
 *    • Staff_Logistics      → status, zone (randomly reassigned)
 *
 *  Usage:
 *    node scripts/simulateData.js
 *    npm run simulate
 */

const { initializeDatabase, dbAll, dbRun, closeDatabase } = require("../database/initDatabase");

// --------------- Configuration ---------------

/** How often (in ms) to run the simulation tick. */
const TICK_INTERVAL_MS = 10_000;

/** Possible staff statuses. */
const STAFF_STATUSES = ["Available", "Busy", "On Break"];

/** Possible staff zones. */
const STAFF_ZONES = [
  "Gate A",
  "Gate B",
  "Gate C",
  "Gate D",
  "Gate E",
  "Gate F",
  "North Stand",
  "South Stand",
  "East Wing",
  "West Pavilion",
  "VIP Lounge",
  "Concession Area",
  "Parking Lot",
  "Control Room",
  "First Aid",
  "Media Box",
];

// --------------- Utility Helpers ---------------

/**
 * Returns a random integer between min and max (inclusive).
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick a random element from an array.
 */
function randomChoice(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

/**
 * Returns the current UTC timestamp in ISO-like format for SQLite.
 */
function now() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

// --------------- Simulation Logic ---------------

/**
 * Update every gate's crowd_density and wait_time with random values.
 */
async function simulateGateTraffic() {
  const gates = await dbAll("SELECT id, gate_name, crowd_density, wait_time, updated_at FROM Gate_Traffic");

  for (const gate of gates) {
    // If gate was updated manually in the last 30 seconds, skip simulation tick
    if (gate.updated_at) {
      const lastUpdated = new Date(gate.updated_at.replace(" ", "T") + "Z").getTime();
      const timeDiffSeconds = (Date.now() - lastUpdated) / 1000;
      if (timeDiffSeconds < 30) {
        console.log(
          `  🚪 ${gate.gate_name}  |  Skipping simulation tick (manual override active, updated ${Math.round(timeDiffSeconds)}s ago)`
        );
        continue;
      }
    }

    const newDensity  = randomInt(10, 100);
    const newWaitTime = randomInt(1, 30);

    await dbRun(
      `UPDATE Gate_Traffic
          SET crowd_density = ?, wait_time = ?, updated_at = ?
        WHERE id = ?`,
      [newDensity, newWaitTime, now(), gate.id]
    );

    // Log only when there is a meaningful change.
    if (newDensity !== gate.crowd_density || newWaitTime !== gate.wait_time) {
      console.log(
        `  🚪 ${gate.gate_name}  |  density: ${gate.crowd_density} → ${newDensity}  |  wait: ${gate.wait_time} min → ${newWaitTime} min`
      );
    }
  }
}

/**
 * Update every concession item's quantity with a random value.
 */
async function simulateConcessionInventory() {
  const items = await dbAll(
    "SELECT id, stand_name, item_name, quantity FROM Concession_Inventory"
  );

  for (const item of items) {
    const newQuantity = randomInt(0, 200);

    await dbRun(
      `UPDATE Concession_Inventory
          SET quantity = ?, updated_at = ?
        WHERE id = ?`,
      [newQuantity, now(), item.id]
    );

    if (newQuantity !== item.quantity) {
      const arrow = newQuantity > item.quantity ? "📈" : "📉";
      console.log(
        `  🍔 ${item.stand_name} — ${item.item_name}  |  qty: ${item.quantity} → ${newQuantity} ${arrow}`
      );
    }
  }
}

/**
 * Randomly update each staff member's status and zone.
 */
async function simulateStaffLogistics() {
  const staff = await dbAll("SELECT id, staff_name, zone, status FROM Staff_Logistics");

  for (const member of staff) {
    const newStatus = randomChoice(STAFF_STATUSES);
    const newZone   = randomChoice(STAFF_ZONES);

    await dbRun(
      `UPDATE Staff_Logistics
          SET status = ?, zone = ?, updated_at = ?
        WHERE id = ?`,
      [newStatus, newZone, now(), member.id]
    );

    const statusChanged = newStatus !== member.status;
    const zoneChanged   = newZone !== member.zone;

    if (statusChanged || zoneChanged) {
      const parts = [];
      if (statusChanged) parts.push(`status: ${member.status} → ${newStatus}`);
      if (zoneChanged)   parts.push(`zone: ${member.zone} → ${newZone}`);
      console.log(`  👷 ${member.staff_name}  |  ${parts.join("  |  ")}`);
    }
  }
}

/**
 * Execute a single simulation tick — updates all three tables.
 */
async function tick() {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`⏱  Simulation tick @ ${timestamp}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  try {
    console.log("\n[Gate Traffic]");
    await simulateGateTraffic();

    console.log("\n[Concession Inventory]");
    await simulateConcessionInventory();

    console.log("\n[Staff Logistics]");
    await simulateStaffLogistics();
  } catch (err) {
    console.error("[Simulator] Error during tick:", err.message);
  }
}

// --------------- Entry Point ---------------

(async function main() {
  try {
    console.log("╔══════════════════════════════════════════════════╗");
    console.log("║     StadiumOps AI — Live Data Simulator         ║");
    console.log("╠══════════════════════════════════════════════════╣");
    console.log("║  Interval : every 10 seconds                    ║");
    console.log("║  Press Ctrl+C to stop                           ║");
    console.log("╚══════════════════════════════════════════════════╝\n");

    // Initialise the database (creates tables + seed if needed).
    await initializeDatabase();

    // Run the first tick immediately, then schedule recurring ticks.
    await tick();
    const intervalId = setInterval(tick, TICK_INTERVAL_MS);

    // Graceful shutdown on SIGINT / SIGTERM.
    const shutdown = async () => {
      console.log("\n[Simulator] Shutting down gracefully...");
      clearInterval(intervalId);
      await closeDatabase();
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err) {
    console.error("[Simulator] Fatal error:", err.message);
    process.exit(1);
  }
})();
