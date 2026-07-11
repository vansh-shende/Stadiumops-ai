/**
 * =========================================================
 *  StadiumOps AI — Dashboard Utility Helpers
 * =========================================================
 *
 *  Pure functions for data classification and formatting.
 *  Shared across multiple components.
 */

/**
 * Returns the severity tier for crowd density percentage.
 * @param {number} value - 0–100
 * @returns {"low"|"medium"|"high"}
 */
export function densityTier(value) {
  if (value < 50) return "low";
  if (value < 80) return "medium";
  return "high";
}

/**
 * Returns the severity tier for wait time in minutes.
 * @param {number} mins
 * @returns {"low"|"medium"|"high"}
 */
export function waitTier(mins) {
  if (mins <= 5) return "low";
  if (mins <= 15) return "medium";
  return "high";
}

/**
 * Returns the quantity tier classification.
 * @param {number} qty
 * @returns {"low"|"medium"|"ok"}
 */
export function qtyTier(qty) {
  if (qty < 30) return "low";
  if (qty < 80) return "medium";
  return "ok";
}

/**
 * Classifies an alert string by its prefix tag.
 * @param {string} text
 * @returns {"critical"|"warning"|"info"}
 */
export function classifyAlert(text) {
  if (text.startsWith("[CRITICAL]")) return "critical";
  if (text.startsWith("[WARNING]")) return "warning";
  return "info";
}

/**
 * Extracts the tag and message from an alert string.
 * @param {string} text - e.g. "[CRITICAL] Deploy staff..."
 * @returns {{ tag: string, message: string }}
 */
export function parseAlert(text) {
  const match = text.match(/^\[(\w+)]\s*(.*)$/);
  if (match) return { tag: match[1], message: match[2] };
  return { tag: "INFO", message: text };
}

/**
 * Formats a UTC ISO date string as a relative "X min ago" label.
 * Falls back to the raw string if parsing fails.
 * @param {string} dateStr - ISO 8601 date string
 * @returns {string}
 */
export function timeAgo(dateStr) {
  if (!dateStr) return "—";
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  } catch {
    return dateStr;
  }
}

/**
 * Computes the four KPI card values from raw dashboard data.
 * @param {Object} data - { gates, inventory, staff }
 * @returns {Array<Object>} KPI card descriptors
 */
export function computeKPIs(data) {
  if (!data) return [];

  const { gates = [], inventory = [], staff = [] } = data;

  // 1. Crowd Density — average across all gates
  const avgDensity =
    gates.length > 0
      ? Math.round(gates.reduce((sum, g) => sum + g.crowd_density, 0) / gates.length)
      : 0;

  // 2. Average Wait Time
  const avgWait =
    gates.length > 0
      ? Math.round(gates.reduce((sum, g) => sum + g.wait_time, 0) / gates.length)
      : 0;

  // 3. Inventory Health — % of items above the low-stock threshold (30)
  const healthyItems = inventory.filter((i) => i.quantity >= 30).length;
  const inventoryHealth =
    inventory.length > 0 ? Math.round((healthyItems / inventory.length) * 100) : 100;

  // 4. Active Staff — count of Available status
  const available = staff.filter((s) => s.status === "Available").length;
  const total = staff.length;

  return [
    {
      id: "crowd-density",
      label: "Crowd Density",
      value: `${avgDensity}%`,
      icon: "👥",
      variant: avgDensity >= 80 ? "danger" : avgDensity >= 50 ? "warning" : "success",
      subtext: `across ${gates.length} gates`,
    },
    {
      id: "avg-wait",
      label: "Avg Wait Time",
      value: `${avgWait} min`,
      icon: "⏱",
      variant: avgWait > 15 ? "danger" : avgWait > 5 ? "warning" : "success",
      subtext: `across ${gates.length} gates`,
    },
    {
      id: "inventory-health",
      label: "Inventory Health",
      value: `${inventoryHealth}%`,
      icon: "📦",
      variant: inventoryHealth >= 80 ? "success" : inventoryHealth >= 50 ? "warning" : "danger",
      subtext: `${healthyItems}/${inventory.length} items stocked`,
    },
    {
      id: "active-staff",
      label: "Active Staff",
      value: `${available} / ${total}`,
      icon: "🧑‍💼",
      variant: available >= total / 2 ? "info" : "danger",
      subtext: "available now",
    },
  ];
}
