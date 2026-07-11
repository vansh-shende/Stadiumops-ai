/**
 * =========================================================
 *  StadiumOps AI — Dashboard Application
 * =========================================================
 *
 *  Pure vanilla JavaScript — no frameworks, no build tools.
 *
 *  Responsibilities:
 *    1. Render KPI summary cards with dummy data.
 *    2. Render Gate Traffic, Inventory and Staff tables.
 *    3. Render the AI Tactical Alert Feed.
 *    4. Keep the header clock ticking every second.
 *    5. Provide helper utilities for DOM creation.
 *
 *  All data lives in data.js (imported via <script> before this file).
 */

/* =========================================================
 *  DOM UTILITIES
 * ========================================================= */

/**
 * Shorthand for creating an element with optional classes,
 * attributes, text content and children.
 *
 * @param {string}   tag          - HTML tag name.
 * @param {Object}   [opts]       - Options bag.
 * @param {string|string[]} [opts.cls]    - CSS class(es).
 * @param {Object}   [opts.attrs] - HTML attributes.
 * @param {string}   [opts.text]  - textContent.
 * @param {string}   [opts.html]  - innerHTML (use sparingly).
 * @param {Node[]}   [opts.children] - Child nodes to append.
 * @returns {HTMLElement}
 */
function el(tag, opts = {}) {
  const node = document.createElement(tag);

  if (opts.cls) {
    const classes = Array.isArray(opts.cls) ? opts.cls : opts.cls.split(" ");
    node.classList.add(...classes);
  }
  if (opts.attrs) {
    Object.entries(opts.attrs).forEach(([k, v]) => node.setAttribute(k, v));
  }
  if (opts.text !== undefined) {
    node.textContent = opts.text;
  }
  if (opts.html !== undefined) {
    node.innerHTML = opts.html;
  }
  if (opts.children) {
    opts.children.forEach((child) => {
      if (child) node.appendChild(child);
    });
  }
  return node;
}

/** Convenience: get element by ID. */
function $(id) {
  return document.getElementById(id);
}

/* =========================================================
 *  HEADER — CLOCK
 * ========================================================= */

/**
 * Updates the header clock every second.
 */
function startClock() {
  const clockEl = $("header-clock");
  if (!clockEl) return;

  function tick() {
    const now = new Date();
    const opts = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    clockEl.textContent = now.toLocaleString("en-US", opts);
  }

  tick();
  setInterval(tick, 1000);
}

/* =========================================================
 *  KPI CARDS
 * ========================================================= */

/**
 * Renders the four KPI cards into #kpi-row.
 * Each KPI card displays a metric value, label, sub-text,
 * trend arrow and a small icon.
 */
function renderKPICards() {
  const container = $("kpi-row");
  if (!container) return;

  window.STADIUM_DATA.kpis.forEach((kpi) => {
    const trendCls =
      kpi.trend === "up"
        ? "kpi-card__trend--up"
        : kpi.trend === "down"
        ? "kpi-card__trend--down"
        : "kpi-card__trend--flat";

    const trendArrow =
      kpi.trend === "up" ? "↑" : kpi.trend === "down" ? "↓" : "→";

    const card = el("div", {
      cls: "kpi-card",
      attrs: { id: `kpi-${kpi.id}` },
      children: [
        el("div", {
          cls: "kpi-card__header",
          children: [
            el("span", { cls: "kpi-card__label", text: kpi.label }),
            el("div", {
              cls: `kpi-card__icon kpi-card__icon--${kpi.variant}`,
              text: kpi.icon,
            }),
          ],
        }),
        el("div", { cls: "kpi-card__value", text: kpi.value }),
        el("div", {
          cls: "kpi-card__sub",
          children: [
            el("span", {
              cls: `kpi-card__trend ${trendCls}`,
              text: `${trendArrow} ${kpi.change}`,
            }),
            document.createTextNode(` ${kpi.subtext}`),
          ],
        }),
      ],
    });

    container.appendChild(card);
  });
}

/* =========================================================
 *  GATE TRAFFIC TABLE
 * ========================================================= */

/**
 * Returns the severity tier for a given percentage value.
 * @param {number} value - 0–100
 * @returns {"low"|"medium"|"high"}
 */
function tier(value) {
  if (value < 50) return "low";
  if (value < 80) return "medium";
  return "high";
}

/**
 * Returns the severity tier for wait time (in minutes).
 * @param {number} mins
 * @returns {"low"|"medium"|"high"}
 */
function waitTier(mins) {
  if (mins <= 5) return "low";
  if (mins <= 15) return "medium";
  return "high";
}

/**
 * Renders the Gate Traffic panel table.
 */
function renderGateTraffic() {
  const tbody = $("gate-traffic-body");
  const countBadge = $("gate-count");
  if (!tbody) return;

  const gates = window.STADIUM_DATA.gateTraffic;
  if (countBadge) countBadge.textContent = gates.length;

  gates.forEach((gate) => {
    const densityTier = tier(gate.crowdDensity);
    const wTier = waitTier(gate.waitTime);

    const row = el("tr", {
      children: [
        // Gate name
        el("td", { text: gate.name }),

        // Crowd density — progress bar + percentage
        el("td", {
          children: [
            el("div", {
              cls: "progress-cell",
              children: [
                (() => {
                  const bar = el("div", { cls: "progress-bar" });
                  const fill = el("div", {
                    cls: `progress-bar__fill progress-bar__fill--${densityTier}`,
                  });
                  fill.style.width = `${gate.crowdDensity}%`;
                  bar.appendChild(fill);
                  return bar;
                })(),
                el("span", {
                  cls: `qty-indicator qty-indicator--${densityTier === "high" ? "low" : densityTier === "medium" ? "medium" : "ok"}`,
                  text: `${gate.crowdDensity}%`,
                }),
              ],
            }),
          ],
        }),

        // Wait time badge
        el("td", {
          children: [
            el("span", {
              cls: `wait-badge wait-badge--${wTier}`,
              text: `${gate.waitTime} min`,
            }),
          ],
        }),

        // Last updated
        el("td", {
          cls: "text-secondary",
          text: gate.updatedAt,
        }),
      ],
    });

    tbody.appendChild(row);
  });
}

/* =========================================================
 *  INVENTORY TABLE
 * ========================================================= */

/**
 * Returns the quantity tier classification.
 * @param {number} qty
 * @returns {"low"|"medium"|"ok"}
 */
function qtyTier(qty) {
  if (qty < 30) return "low";
  if (qty < 80) return "medium";
  return "ok";
}

/**
 * Renders the Concession Inventory panel table.
 */
function renderInventory() {
  const tbody = $("inventory-body");
  const countBadge = $("inventory-count");
  if (!tbody) return;

  const items = window.STADIUM_DATA.inventory;
  if (countBadge) countBadge.textContent = items.length;

  items.forEach((item) => {
    const qTier = qtyTier(item.quantity);

    const row = el("tr", {
      children: [
        el("td", { text: item.stand }),
        el("td", { text: item.item }),
        el("td", {
          children: [
            el("span", {
              cls: `qty-indicator qty-indicator--${qTier}`,
              text: String(item.quantity),
            }),
          ],
        }),
        el("td", { cls: "text-secondary", text: item.updatedAt }),
      ],
    });

    tbody.appendChild(row);
  });
}

/* =========================================================
 *  STAFF LOGISTICS TABLE
 * ========================================================= */

/**
 * Renders the Staff Logistics panel table.
 */
function renderStaff() {
  const tbody = $("staff-body");
  const countBadge = $("staff-count");
  if (!tbody) return;

  const staff = window.STADIUM_DATA.staff;
  if (countBadge) countBadge.textContent = staff.length;

  staff.forEach((member) => {
    const statusCls =
      member.status === "Available"
        ? "status-pill--available"
        : member.status === "Busy"
        ? "status-pill--busy"
        : "status-pill--break";

    const statusDot =
      member.status === "Available" ? "●" : member.status === "Busy" ? "●" : "●";

    const row = el("tr", {
      children: [
        el("td", { text: member.name }),
        el("td", { text: member.zone }),
        el("td", {
          children: [
            el("span", {
              cls: `status-pill ${statusCls}`,
              children: [
                el("span", { text: statusDot }),
                document.createTextNode(member.status),
              ],
            }),
          ],
        }),
        el("td", { cls: "text-secondary", text: member.updatedAt }),
      ],
    });

    tbody.appendChild(row);
  });
}

/* =========================================================
 *  AI TACTICAL ALERT FEED
 * ========================================================= */

/**
 * Classifies an alert string by its prefix tag.
 * @param {string} alertText
 * @returns {"critical"|"warning"|"info"}
 */
function classifyAlert(alertText) {
  if (alertText.startsWith("[CRITICAL]")) return "critical";
  if (alertText.startsWith("[WARNING]")) return "warning";
  return "info";
}

/**
 * Extracts the tag text (e.g. "CRITICAL") and the rest of the message.
 * @param {string} alertText
 * @returns {{tag: string, message: string}}
 */
function parseAlert(alertText) {
  const match = alertText.match(/^\[(\w+)]\s*(.*)$/);
  if (match) return { tag: match[1], message: match[2] };
  return { tag: "INFO", message: alertText };
}

/**
 * Renders the AI Tactical Alert Feed list items.
 */
function renderAlertFeed() {
  const list = $("alert-feed-list");
  const timestamp = $("alert-feed-timestamp");
  if (!list) return;

  const alerts = window.STADIUM_DATA.alerts;

  alerts.forEach((alertObj, index) => {
    const level = classifyAlert(alertObj.text);
    const parsed = parseAlert(alertObj.text);

    const item = el("li", {
      cls: `alert-item alert-item--${level}`,
      attrs: { style: `animation-delay: ${index * 60}ms` },
      children: [
        el("span", { cls: "alert-item__tag", text: `[${parsed.tag}]` }),
        el("span", { cls: "alert-item__message", text: parsed.message }),
        el("span", { cls: "alert-item__time", text: alertObj.time }),
      ],
    });

    list.appendChild(item);
  });

  // Set footer timestamp
  if (timestamp) {
    timestamp.textContent = `Last updated: ${new Date().toLocaleTimeString("en-US", { hour12: false })}`;
  }
}

/* =========================================================
 *  INITIALISATION
 * ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  startClock();
  renderKPICards();
  renderGateTraffic();
  renderInventory();
  renderStaff();
  renderAlertFeed();
});
