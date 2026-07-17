/**
 * =========================================================
 *  StadiumOps AI — Express Server Entry Point
 * =========================================================
 *
 *  Responsibility:
 *    Bootstrap middleware, mount API routes, initialise the
 *    database, and start listening.  No business logic here.
 *
 *  Security layers (defence-in-depth):
 *    1. Helmet — sets secure HTTP headers (XSS, HSTS, etc.).
 *    2. CORS — whitelisted origins only.
 *    3. Rate Limiting — per-IP request throttling.
 *    4. Body Size Limit — prevents payload-based DoS.
 *    5. Input Validation — express-validator middleware.
 *    6. Global Error Handler — sanitises all error responses.
 *
 *  Efficiency layers:
 *    1. Compression — gzip/brotli response compression.
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
const compression = require("compression");
require("dotenv").config();

const { initializeDatabase } = require("./database/initDatabase");
const { startAlertEngine } = require("./services/alertEngine");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3000;

// --------------- Security Middleware ---------------

// 1. Helmet — set secure HTTP response headers
app.use(helmet({
  contentSecurityPolicy: false, // Avoid blocking React developer scripts
}));

// 2. CORS — restrict to known frontend origins only
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "https://frontend-xi-six-14.vercel.app",
  process.env.FRONTEND_URL, // Optional: additional origin from env
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow server-to-server requests (no origin) and whitelisted origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// 3. Response compression (gzip/brotli) for bandwidth efficiency
app.use(compression());

// 4. JSON body parser with size limit to prevent payload-based DoS
app.use(express.json({ limit: "100kb" }));

// 5. Rate limiting — throttle requests per IP
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

// --------------- Global Error Handler (must be LAST middleware) ---------------
app.use(errorHandler);

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
