/**
 * =========================================================
 *  StadiumOps AI — API Service Layer
 * =========================================================
 *
 *  Centralised HTTP client for all backend API calls.
 *  Base URL is read from the VITE_API_BASE_URL env variable.
 *
 *  Features:
 *    - Timeout handling (15s) for Render cold starts
 *    - Automatic fallback to demo data when backend is unreachable
 *    - Graceful degradation for Vercel deployments
 *
 *  Exports three reusable async functions:
 *    - getDashboard()   → GET /api/dashboard
 *    - getLiveAlerts()   → GET /api/live-alerts
 *    - getAlertHistory() → GET /api/alert-history
 */

import { MOCK_DASHBOARD, MOCK_LIVE_ALERTS, MOCK_ALERT_HISTORY } from "./mockData";

/** Render-hosted backend URL (used as fallback when localhost is unreachable). */
const RENDER_URL = "https://stadiumops-ai-36cn.onrender.com";

/**
 * Determine the correct backend URL.
 * If the env var points to localhost but we're running on a deployed site
 * (not localhost), automatically switch to the Render backend URL.
 */
function resolveApiBase() {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  const isDeployed = typeof window !== "undefined" && !window.location.hostname.includes("localhost");

  // If no env var set, use Render
  if (!envUrl) return RENDER_URL;

  // If env var points to localhost but we're deployed, use Render
  if (isDeployed && (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"))) {
    return RENDER_URL;
  }

  return envUrl;
}

const API_BASE = resolveApiBase();

/** Request timeout in ms — Render free tier can take up to ~30s on cold start */
const REQUEST_TIMEOUT = 15_000;

/** Track whether we've ever successfully connected to the real backend */
let hasConnectedOnce = false;

/**
 * Generic fetch wrapper with timeout and error handling.
 * @param {string} endpoint - API path (e.g. "/api/dashboard").
 * @param {Object} options - fetch options.
 * @returns {Promise<Object>} Parsed JSON response.
 * @throws {Error} On network failure, timeout, or non-OK status.
 */
async function fetchJSON(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  // Create an AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      // Try to extract server error message
      let errorMessage = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        errorMessage = body.error || errorMessage;
      } catch {
        // Response wasn't JSON — keep the status-based message
      }
      throw new Error(errorMessage);
    }

    hasConnectedOnce = true;
    return res.json();
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === "AbortError") {
      throw new Error("Request timed out — backend may be starting up");
    }
    throw err;
  }
}

// --------------- Public API Functions ---------------

/**
 * GET /api/dashboard
 * Returns unified snapshot: { success, data: { gates, inventory, staff, generatedAt } }
 * Falls back to demo data if the backend is unreachable.
 */
export async function getDashboard() {
  try {
    return await fetchJSON("/api/dashboard");
  } catch (err) {
    // If we've never connected, return mock data so the UI loads
    if (!hasConnectedOnce) {
      console.warn("[StadiumOps] Backend unreachable, using demo data:", err.message);
      return { ...MOCK_DASHBOARD, _isDemo: true };
    }
    throw err;
  }
}

/**
 * GET /api/live-alerts
 * Returns AI directives: { success, generatedAt, anomalyCount, alerts }
 * Or processing state:   { success, status: "processing" }
 * Falls back to demo data if the backend is unreachable.
 */
export async function getLiveAlerts() {
  try {
    return await fetchJSON("/api/live-alerts");
  } catch (err) {
    if (!hasConnectedOnce) {
      console.warn("[StadiumOps] Backend unreachable for alerts, using demo data:", err.message);
      return { ...MOCK_LIVE_ALERTS, _isDemo: true };
    }
    throw err;
  }
}

/**
 * GET /api/alert-history
 * Returns historical alerts: { success, count, history }
 * Falls back to demo data if the backend is unreachable.
 */
export async function getAlertHistory() {
  try {
    return await fetchJSON("/api/alert-history");
  } catch (err) {
    if (!hasConnectedOnce) {
      console.warn("[StadiumOps] Backend unreachable for history, using demo data:", err.message);
      return { ...MOCK_ALERT_HISTORY, _isDemo: true };
    }
    throw err;
  }
}

/**
 * POST /api/gates/action
 * Sends a manual operation command for a gate: { success, message, data }
 */
export async function postGateAction(gateName, action) {
  return fetchJSON("/api/gates/action", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ gateName, action }),
  });
}
