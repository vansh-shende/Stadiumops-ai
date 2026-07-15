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
const path = require("path");
require("dotenv").config();

const { initializeDatabase } = require("./database/initDatabase");
const { startAlertEngine } = require("./services/alertEngine");
const logger = require("./utils/logger");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

// --------------- Middleware ---------------
app.use(helmet({
  contentSecurityPolicy: false, // Avoid blocking React developer scripts
}));
app.use(cors());
app.use(express.json());

// Set up rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Higher limit for development and multiple dashboard tabs polling concurrently
  standardHeaders: true, 
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later."
  }
});
app.use("/api/", limiter);

// --------------- Health Check / Static Assets ---------------
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
} else {
  app.get("/", (_req, res) => {
    res.json({ status: "Server Running" });
  });
}

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

// --------------- SPA Routing Wildcard ---------------
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api/")) {
      res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    }
  });
}

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
