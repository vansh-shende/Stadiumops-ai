/**
 * =========================================================
 *  StadiumOps AI — Express Server Entry Point
 * =========================================================
 *
 *  Responsibility:
 *    Bootstrap middleware, mount API routes, initialise the
 *    database, and start listening.  No business logic here.
 */

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { initializeDatabase } = require("./database/initDatabase");
const { startAlertEngine } = require("./services/alertEngine");
const logger = require("./utils/logger");

const app = express();
const PORT = process.env.PORT || 3000;

// --------------- Middleware ---------------
app.use(cors());
app.use(express.json());

// --------------- Health Check ---------------
app.get("/", (_req, res) => {
  res.json({ status: "Server Running" });
});

// --------------- API Routes ---------------
app.use("/api/gates", require("./routes/gates"));
app.use("/api/inventory", require("./routes/inventory"));
app.use("/api/staff", require("./routes/staff"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/test-ai", require("./routes/ai"));
app.use("/api/stadium", require("./routes/stadium"));
app.use("/api/anomalies", require("./routes/anomaly"));
app.use("/api/alerts", require("./routes/alerts"));
app.use("/api/live-alerts", require("./routes/liveAlerts"));
app.use("/api/alert-history", require("./routes/alertHistory"));

// --------------- Start Server ---------------
(async () => {
  try {
    // Initialise DB (creates tables + seeds data if empty).
    await initializeDatabase();

    app.listen(PORT, () => {
      logger.info("Server", `StadiumOps AI listening on port ${PORT}`);
      // Boot the continuous live Alert Engine loop
      startAlertEngine();
    });
  } catch (err) {
    logger.error("Server", "Failed to start:", err.message);
    process.exit(1);
  }
})();
