/**
 * =========================================================
 *  StadiumOps AI — Database Connection Module
 * =========================================================
 *
 *  Responsibility:
 *    Own the single SQLite connection instance and expose
 *    Promise-wrapped query helpers (dbRun, dbGet, dbAll).
 *    No schema or seed logic lives here — that stays in
 *    database/initDatabase.js.
 *
 *  Why separated:
 *    Decoupling the connection from schema management means any
 *    module can import query helpers without pulling in seed data,
 *    migration logic, or table definitions.
 *
 *  Usage:
 *    const { dbRun, dbGet, dbAll } = require("../config/database");
 */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const logger = require("../utils/logger");

// --------------- Constants ---------------

/** Path to the SQLite database file. */
const DB_PATH = path.join(__dirname, "..", "database", "stadium.db");

/** Single module-level reference to the database handle. */
let db = null;

// --------------- Connection Management ---------------

/**
 * Open (or return the existing) SQLite connection.
 * Enables WAL mode for better concurrent read performance.
 * @returns {Promise<sqlite3.Database>}
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    if (db) return resolve(db);

    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        logger.error("DB", "Failed to open database:", err.message);
        return reject(err);
      }
      logger.info("DB", "Connected to SQLite database at", DB_PATH);
      // Enable WAL mode for better concurrent read performance.
      db.run("PRAGMA journal_mode=WAL", (pragmaErr) => {
        if (pragmaErr) logger.warn("DB", "Could not set WAL mode:", pragmaErr.message);
      });
      resolve(db);
    });
  });
}

/**
 * Returns the current database handle.
 * Throws if the database has not been opened yet.
 */
function getDb() {
  if (!db) {
    throw new Error("Database not initialised. Call openDatabase() first.");
  }
  return db;
}

// --------------- Promise-Wrapped Query Helpers ---------------

/**
 * Execute a write statement (INSERT / UPDATE / DELETE / DDL).
 * Resolves with { lastID, changes }.
 * @param {string} sql   - SQL statement.
 * @param {Array}  params - Bind parameters (optional).
 */
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

/**
 * Fetch a single row.
 * @param {string} sql   - SQL SELECT statement.
 * @param {Array}  params - Bind parameters (optional).
 */
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

/**
 * Fetch all matching rows.
 * @param {string} sql   - SQL SELECT statement.
 * @param {Array}  params - Bind parameters (optional).
 */
function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/**
 * Close the database connection cleanly.
 */
function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (!db) return resolve();
    db.close((err) => {
      if (err) return reject(err);
      db = null;
      logger.info("DB", "Database connection closed.");
      resolve();
    });
  });
}

// --------------- Exports ---------------

module.exports = {
  openDatabase,
  getDb,
  dbRun,
  dbGet,
  dbAll,
  closeDatabase,
};
