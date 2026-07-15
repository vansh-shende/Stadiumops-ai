/**
 * =========================================================
 *  StadiumOps AI — API Service Layer
 * =========================================================
 *
 *  Centralised HTTP client for all backend API calls.
 *  Base URL is read from the VITE_API_BASE_URL env variable.
 *
 *  Exports three reusable async functions:
 *    - getDashboard()   → GET /api/dashboard
 *    - getLiveAlerts()   → GET /api/live-alerts
 *    - getAlertHistory() → GET /api/alert-history
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://stadiumops-ai-36cn.onrender.com";

/**
 * Generic fetch wrapper with error handling.
 * @param {string} endpoint - API path (e.g. "/api/dashboard").
 * @returns {Promise<Object>} Parsed JSON response.
 * @throws {Error} On network failure or non-OK status.
 */
async function fetchJSON(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const res = await fetch(url, options);

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

  return res.json();
}

// --------------- Public API Functions ---------------

/**
 * GET /api/dashboard
 * Returns unified snapshot: { success, data: { gates, inventory, staff, generatedAt } }
 */
export async function getDashboard() {
  return fetchJSON("/api/dashboard");
}

/**
 * GET /api/live-alerts
 * Returns AI directives: { success, generatedAt, anomalyCount, alerts }
 * Or processing state:   { success, status: "processing" }
 */
export async function getLiveAlerts() {
  return fetchJSON("/api/live-alerts");
}

/**
 * GET /api/alert-history
 * Returns historical alerts: { success, count, history }
 */
export async function getAlertHistory() {
  return fetchJSON("/api/alert-history");
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
