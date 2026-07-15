import { useState, useEffect, useMemo, memo } from "react";
import { useSimulation } from "../../../context/SimulationContext";
import { DEFAULT_PREDICTIONS } from "../../../constants/dashboardConstants";
import Card from "../../shared/ui/Card";
import PredictionCard from "../../shared/ui/PredictionCard";

export default memo(function PredictionPanel({ dashboard }) {
  const { activeSimulation, isSimulating } = useSimulation();
  const [animatedProbs, setAnimatedProbs] = useState({});

  // Build predictions from live data + defaults
  const predictions = useMemo(() => {
    const basePredictions = (() => {
      const preds = DEFAULT_PREDICTIONS.map(p => ({ ...p }));
      const gates = dashboard?.gates || [];
      
      // Enhance predictions based on real gate data
      gates.forEach((gate) => {
        if (gate.crowd_density >= 75) {
          const gateName = gate.gate_name.split(" - ")[0];
          const existing = preds.find((p) => p.gate === gateName);
          if (existing) {
            existing.probability = Math.min(99, gate.crowd_density + 8);
          } else {
            // Add dynamically if a new gate becomes congested
            preds.unshift({
              id: `dyn-${gate.id}`,
              gate: gateName,
              metric: "Congestion Probability",
              probability: Math.min(99, gate.crowd_density + 8),
              eta: "5 min",
              action: "Open Overflow Gate",
              reduction: "30%",
              severity: "danger",
            });
          }
        }
      });

      // Keep top 3 most critical predictions
      return preds.sort((a, b) => b.probability - a.probability).slice(0, 3);
    })();

    // Override with simulation prediction
    return isSimulating && activeSimulation?.prediction
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
  }, [dashboard?.gates, isSimulating, activeSimulation?.prediction]);

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
  }, [predictions]);

  return (
    <Card
      title="Predictive Intelligence"
      icon="🔮"
      headerRight={<span className="prediction-panel__engine-badge">ML ENGINE</span>}
      className="prediction-panel"
      id="prediction-panel"
    >
      <div className="card__body prediction-body">
        {predictions.map((pred) => {
          const badgeText = pred.severity === "danger" ? "HIGH" : pred.severity === "warning" ? "MED" : "LOW";
          return (
            <PredictionCard
              key={pred.id}
              location={pred.gate}
              badgeText={badgeText}
              metricLabel={pred.metric}
              probability={animatedProbs[pred.id] ?? 0}
              action={pred.action}
              reduction={pred.reduction}
              eta={pred.eta}
              variant={pred.severity}
            />
          );
        })}
      </div>
    </Card>
  );
});
