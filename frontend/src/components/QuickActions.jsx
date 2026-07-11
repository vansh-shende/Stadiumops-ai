/**
 * =========================================================
 *  StadiumOps AI — Quick Actions Panel (Feature 4)
 * =========================================================
 *
 *  Action buttons that trigger frontend-only simulations.
 *  No backend calls — all visual/state changes are handled
 *  by the SimulationContext.
 */

import { useState } from "react";
import { useSimulation } from "../context/SimulationContext";

const ACTIONS = [
  {
    key: "crowdSurge",
    label: "Simulate Crowd Surge",
    icon: "⚡",
    description: "Trigger a mass ingress event at Gate D",
    variant: "danger",
  },
  {
    key: "overflowGate",
    label: "Open Overflow Gate",
    icon: "🚪",
    description: "Activate Gate D2 overflow protocol",
    variant: "warning",
  },
  {
    key: "emergencyTeam",
    label: "Deploy Emergency Team",
    icon: "🚑",
    description: "Dispatch medical team Alpha to Section 14B",
    variant: "danger",
  },
  {
    key: "broadcast",
    label: "Broadcast Announcement",
    icon: "📢",
    description: "PA system advisory for crowd management",
    variant: "info",
  },
];

export default function QuickActions() {
  const { runSimulation, isSimulating, activeSimulation, clearSimulation } = useSimulation();
  const [rippleKey, setRippleKey] = useState(null);

  const handleAction = (key) => {
    setRippleKey(key);
    runSimulation(key);
    setTimeout(() => setRippleKey(null), 600);
  };

  return (
    <article
      className="card quick-actions-panel"
      id="quick-actions-panel"
      tabIndex="0"
      aria-label="Quick Command Actions"
    >
      <div className="card__header">
        <h2 className="card__title">
          <span className="card__title-icon">🎯</span>
          Quick Commands
        </h2>
        {isSimulating && (
          <button
            className="btn btn--xs quick-actions__cancel"
            onClick={clearSimulation}
            aria-label="Cancel active simulation"
          >
            ✕ CANCEL SIM
          </button>
        )}
      </div>

      <div className="card__body quick-actions-grid">
        {ACTIONS.map((action) => {
          const isActive = isSimulating && activeSimulation?.key === action.key;
          return (
            <button
              key={action.key}
              className={`quick-action-btn quick-action-btn--${action.variant} ${isActive ? "quick-action-btn--active" : ""} ${rippleKey === action.key ? "quick-action-btn--ripple" : ""}`}
              onClick={() => handleAction(action.key)}
              disabled={isSimulating && !isActive}
              aria-label={action.label}
              id={`action-${action.key}`}
            >
              <span className="quick-action-btn__icon">{action.icon}</span>
              <div className="quick-action-btn__text">
                <span className="quick-action-btn__label">{action.label}</span>
                <span className="quick-action-btn__desc">{action.description}</span>
              </div>
              {isActive && (
                <div className="quick-action-btn__active-indicator">
                  <span className="quick-action-btn__spinner" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </article>
  );
}
