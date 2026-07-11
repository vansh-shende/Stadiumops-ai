/**
 * =========================================================
 *  StadiumOps AI — Database Initialization Module
 * =========================================================
 *
 *  Responsibility:
 *    Schema creation and seed-data insertion ONLY.
 *    The raw connection and query helpers live in config/database.js.
 *
 *  This module:
 *    1. Opens the SQLite connection (via config/database).
 *    2. Creates the three core tables if they don't exist.
 *    3. Seeds each table with realistic sample data when empty.
 *    4. Re-exports every helper from config/database for
 *       backward-compatible imports throughout the app.
 *
 *  Usage:
 *    const { initializeDatabase } = require("./database/initDatabase");
 *    await initializeDatabase();
 */

const {
  openDatabase,
  getDb,
  dbRun,
  dbGet,
  dbAll,
  closeDatabase,
} = require("../config/database");
const logger = require("../utils/logger");

// --------------- Schema Definitions ---------------

const CREATE_GATE_TRAFFIC = `
  CREATE TABLE IF NOT EXISTS Gate_Traffic (
    id             INTEGER  PRIMARY KEY AUTOINCREMENT,
    gate_name      TEXT     NOT NULL,
    crowd_density  INTEGER  NOT NULL DEFAULT 0,
    wait_time      INTEGER  NOT NULL DEFAULT 0,
    updated_at     DATETIME NOT NULL DEFAULT (datetime('now'))
  );
`;

const CREATE_CONCESSION_INVENTORY = `
  CREATE TABLE IF NOT EXISTS Concession_Inventory (
    id          INTEGER  PRIMARY KEY AUTOINCREMENT,
    stand_name  TEXT     NOT NULL,
    item_name   TEXT     NOT NULL,
    quantity    INTEGER  NOT NULL DEFAULT 0,
    updated_at  DATETIME NOT NULL DEFAULT (datetime('now'))
  );
`;

const CREATE_STAFF_LOGISTICS = `
  CREATE TABLE IF NOT EXISTS Staff_Logistics (
    id          INTEGER  PRIMARY KEY AUTOINCREMENT,
    staff_name  TEXT     NOT NULL,
    zone        TEXT     NOT NULL,
    status      TEXT     NOT NULL DEFAULT 'Available',
    updated_at  DATETIME NOT NULL DEFAULT (datetime('now'))
  );
`;

// --------------- Sample / Seed Data ---------------

const GATE_SEED = [
  { gate_name: "Gate A - Main Entrance",   crowd_density: 45, wait_time: 8  },
  { gate_name: "Gate B - North Stand",     crowd_density: 72, wait_time: 15 },
  { gate_name: "Gate C - East Wing",       crowd_density: 30, wait_time: 5  },
  { gate_name: "Gate D - South Stand",     crowd_density: 60, wait_time: 12 },
  { gate_name: "Gate E - VIP Entrance",    crowd_density: 18, wait_time: 3  },
  { gate_name: "Gate F - West Pavilion",   crowd_density: 55, wait_time: 10 },
];

const CONCESSION_SEED = [
  { stand_name: "Hot Dog Haven",      item_name: "Classic Hot Dog",     quantity: 150 },
  { stand_name: "Hot Dog Haven",      item_name: "Veggie Dog",          quantity: 80  },
  { stand_name: "Pizza Corner",       item_name: "Pepperoni Slice",     quantity: 120 },
  { stand_name: "Pizza Corner",       item_name: "Margherita Slice",    quantity: 95  },
  { stand_name: "Burger Barn",        item_name: "Cheeseburger",        quantity: 110 },
  { stand_name: "Burger Barn",        item_name: "Chicken Burger",      quantity: 75  },
  { stand_name: "Drinks Station",     item_name: "Soda (Large)",        quantity: 200 },
  { stand_name: "Drinks Station",     item_name: "Bottled Water",       quantity: 180 },
  { stand_name: "Drinks Station",     item_name: "Craft Beer",          quantity: 60  },
  { stand_name: "Nachos & More",      item_name: "Loaded Nachos",       quantity: 90  },
  { stand_name: "Sweet Treats",       item_name: "Cotton Candy",        quantity: 40  },
  { stand_name: "Sweet Treats",       item_name: "Ice Cream Cone",      quantity: 65  },
];

const STAFF_SEED = [
  { staff_name: "James Carter",    zone: "Gate A",          status: "Available" },
  { staff_name: "Priya Sharma",    zone: "North Stand",     status: "Busy"      },
  { staff_name: "Marcus Johnson",  zone: "East Wing",       status: "Available" },
  { staff_name: "Elena Rodriguez", zone: "Concession Area", status: "On Break"  },
  { staff_name: "David Kim",       zone: "VIP Lounge",      status: "Busy"      },
  { staff_name: "Aisha Patel",     zone: "South Stand",     status: "Available" },
  { staff_name: "Tom Wilson",      zone: "Parking Lot",     status: "Busy"      },
  { staff_name: "Sophie Chen",     zone: "West Pavilion",   status: "Available" },
  { staff_name: "Raj Mehta",       zone: "Control Room",    status: "Busy"      },
  { staff_name: "Olivia Brown",    zone: "First Aid",       status: "Available" },
];

// --------------- Seed Logic ---------------

/**
 * Insert seed rows into a table only when it contains zero rows.
 * @param {string} tableName  - Name of the target table.
 * @param {Array}  rows       - Array of plain objects whose keys match columns.
 */
async function seedTableIfEmpty(tableName, rows) {
  const { count } = await dbGet(`SELECT COUNT(*) AS count FROM ${tableName}`);

  if (count > 0) {
    logger.info("DB", `${tableName} already contains ${count} row(s) — skipping seed.`);
    return;
  }

  // Build a parameterised INSERT for each row.
  const columns = Object.keys(rows[0]);
  const placeholders = `(${columns.map(() => "?").join(", ")})`;
  const sql = `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES ${placeholders}`;

  for (const row of rows) {
    const values = columns.map((col) => row[col]);
    await dbRun(sql, values);
  }

  logger.info("DB", `Seeded ${tableName} with ${rows.length} row(s).`);
}

// --------------- Public Initialiser ---------------

/**
 * Initialise the database: open connection → create tables → seed data.
 * Safe to call multiple times (idempotent).
 */
async function initializeDatabase() {
  try {
    await openDatabase();

    // Create tables (IF NOT EXISTS makes this idempotent).
    await dbRun(CREATE_GATE_TRAFFIC);
    logger.info("DB", "Table Gate_Traffic .............. OK");

    await dbRun(CREATE_CONCESSION_INVENTORY);
    logger.info("DB", "Table Concession_Inventory ...... OK");

    await dbRun(CREATE_STAFF_LOGISTICS);
    logger.info("DB", "Table Staff_Logistics ........... OK");

    // Seed sample data when tables are empty.
    await seedTableIfEmpty("Gate_Traffic", GATE_SEED);
    await seedTableIfEmpty("Concession_Inventory", CONCESSION_SEED);
    await seedTableIfEmpty("Staff_Logistics", STAFF_SEED);

    logger.info("DB", "Database initialisation complete.");
  } catch (err) {
    logger.error("DB", "Initialisation failed:", err.message);
    throw err;
  }
}

// --------------- Exports ---------------
// Re-export database helpers for backward compatibility.

module.exports = {
  initializeDatabase,
  getDb,
  dbRun,
  dbGet,
  dbAll,
  closeDatabase,
};
