/**
 * =========================================================
 *  StadiumOps AI — Prediction Panel (Feature 2)
 * =========================================================
 *
 *  Displays AI-generated predictive insights with
 *  animated probability meters and recommended actions.
 */

import { useState, useEffect, memo } from "react";
import { useSimulation } from "../context/SimulationContext";

const DEFAULT_PREDICTIONS = [
  {
    id: 1,
    gate: "Gate C",
    metric: "Congestion Probability",
    probability: 91,
    eta: "4 min",
    action: "Open Overflow Gate",
    reduction: "38%",
    severity: "danger",
  },
  {
    id: 2,
    gate: "Gate B",
    metric: "Wait Time Escalation",
    probability: 67,
    eta: "8 min",
    action: "Redistribute Queue",
    reduction: "22%",
    severity: "warning",
  },
  {
    id: 3,
    gate: "Food Court",
    metric: "Stockout Risk",
    probability: 45,
    eta: "12 min",
    action: "Priority Restock",
    reduction: "15%",
    severity: "info",
  },
];

function AnimatedBar({ target, color }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setWidth(target), 100);
    return () => clearTimeout(timer);
  }, [target]);

  return (
    <div className="prediction-bar">
      <div
        className="prediction-bar__fill"
        style={{
          width: `${width}%`,
          backgroundColor: color,
          transition: "width 1s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
    </div>
  );
}

export default memo(function PredictionPanel({ liveAlerts, dashboard }) {
  const { activeSimulation, isSimulating } = useSimulation();
  const [animatedProbs, setAnimatedProbs] = useState({});

  // Build predictions from live data + defaults
  const basePredictions = (() => {
    const preds = [...DEFAULT_PREDICTIONS];
    const gates = dashboard?.gates || [];
    
    // Enhance predictions based on real gate data
    gates.forEach((gate) => {
      if (gate.crowd_density >= 75) {
        const existing = preds.find((p) => p.gate === gate.gate_name.split(" - ")[0]);
        if (existing) {
          existing.probability = Math.min(99, gate.crowd_density + 8);
        }
      }
    });

    return preds;
  })();

  // Override with simulation prediction
  const predictions = isSimulating && activeSimulation?.prediction
    ? [
        {
          id: "sim",
          gate: activeSimulation.prediction.gate,
          metric: "Simulation Prediction",
          probability: activeSimulation.prediction.probability,
          eta: activeSimulation.prediction.eta,
          action: activeSimulation.prediction.action,
          reduction: activeSimulation.prediction.reduction,
          severity: "danger",
        },
        ...basePredictions.slice(0, 2),
      ]
    : basePredictions;

  // Animate probability counters
  useEffect(() => {
    const targets = {};
    predictions.forEach((p) => {
      targets[p.id] = p.probability;
    });

    // Start from 0 and count up
    const counts = {};
    predictions.forEach((p) => { counts[p.id] = 0; });
    setAnimatedProbs({ ...counts });

    const interval = setInterval(() => {
      let allDone = true;
      predictions.forEach((p) => {
        if (counts[p.id] < targets[p.id]) {
          counts[p.id] = Math.min(counts[p.id] + 2, targets[p.id]);
          allDone = false;
        }
      });
      setAnimatedProbs({ ...counts });
      if (allDone) clearInterval(interval);
    }, 20);

    return () => clearInterval(interval);
  }, [isSimulating, liveAlerts]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "danger": return "var(--color-danger)";
      case "warning": return "var(--color-warning)";
      default: return "var(--color-info)";
    }
  };

  return (
    <article
      className="card prediction-panel"
      id="prediction-panel"
      tabIndex="0"
      aria-label="AI Predictions"
    >
      <div className="card__header">
        <h2 className="card__title">
          <span className="card__title-icon">🔮</span>
          Predictive Intelligence
        </h2>
        <span className="prediction-panel__engine-badge">ML ENGINE</span>
      </div>

      <div className="card__body prediction-body">
        {predictions.map((pred) => (
          <div
            key={pred.id}
            className={`prediction-card prediction-card--${pred.severity}`}
          >
            <div className="prediction-card__header">
              <span className="prediction-card__location">{pred.gate}</span>
              <span className={`prediction-card__severity badge badge--${pred.severity === "danger" ? "critical" : pred.severity}`}>
                {pred.severity === "danger" ? "HIGH" : pred.severity === "warning" ? "MED" : "LOW"}
              </span>
            </div>

            <div className="prediction-card__metric">
              <span className="prediction-card__metric-label">{pred.metric}</span>
              <div className="prediction-card__prob-row">
                <span className="prediction-card__prob-value" style={{ color: getSeverityColor(pred.severity) }}>
                  {animatedProbs[pred.id] ?? 0}%
                </span>
                <AnimatedBar target={pred.probability} color={getSeverityColor(pred.severity)} />
              </div>
            </div>

            <div className="prediction-card__details">
              <div className="prediction-detail">
                <span className="prediction-detail__label">ETA</span>
                <span className="prediction-detail__value">{pred.eta}</span>
              </div>
              <div className="prediction-detail">
                <span className="prediction-detail__label">ACTION</span>
                <span className="prediction-detail__value">{pred.action}</span>
              </div>
              <div className="prediction-detail">
                <span className="prediction-detail__label">REDUCTION</span>
                <span className="prediction-detail__value prediction-detail__value--accent">{pred.reduction}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
});
