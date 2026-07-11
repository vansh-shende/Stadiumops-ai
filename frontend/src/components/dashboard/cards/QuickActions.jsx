import { useState, memo } from "react";
import { useSimulation } from "../../../context/SimulationContext";
import { QUICK_ACTIONS } from "../../../constants/dashboardConstants";
import Card from "../../shared/ui/Card";
import Button from "../../shared/ui/Button";

export default memo(function QuickActions() {
  const { runSimulation, isSimulating, activeSimulation, clearSimulation } = useSimulation();
  const [rippleKey, setRippleKey] = useState(null);

  const handleAction = (key) => {
    setRippleKey(key);
    runSimulation(key);
    setTimeout(() => setRippleKey(null), 600);
  };

  return (
    <Card
      title="Quick Commands"
      icon="🎯"
      headerRight={
        isSimulating && (
          <Button
            variant="secondary"
            size="xs"
            className="quick-actions__cancel"
            onClick={clearSimulation}
            ariaLabel="Cancel active simulation"
          >
            ✕ CANCEL SIM
          </Button>
        )
      }
      className="quick-actions-panel"
      id="quick-actions-panel"
    >
      <div className="card__body quick-actions-grid">
        {QUICK_ACTIONS.map((action) => {
          const isActive = isSimulating && activeSimulation?.key === action.key;
          return (
            <button
              key={action.key}
              className={`quick-action-btn quick-action-btn--${action.variant} ${isActive ? "quick-action-btn--active" : ""} ${rippleKey === action.key ? "quick-action-btn--ripple" : ""}`}
              onClick={() => handleAction(action.key)}
              disabled={isSimulating && !isActive}
              id={`action-${action.key}`}
            >
              <span className="quick-action-btn__icon" aria-hidden="true">{action.icon}</span>
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
    </Card>
  );
});
