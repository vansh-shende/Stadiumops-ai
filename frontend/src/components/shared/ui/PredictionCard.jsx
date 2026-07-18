import React from "react";
import ProgressBar from "./ProgressBar";

/**
 * PredictionCard — A modular presentation card that outputs predictive details.
 *
 * Shows location, risk severity badges, progress indicators, action plans, and ETA countdowns.
 *
 * @param {Object} props
 * @param {string} props.location - Gate/location name (e.g. "Gate A").
 * @param {string} props.badgeText - Risk severity code (e.g. "HIGH", "MED").
 * @param {string} props.metricLabel - Description of metric being monitored (e.g. "Congestion Probability").
 * @param {number} props.probability - Numeric percentage probability (0-100).
 * @param {string} props.action - Recommanded tactical resolution directive.
 * @param {string} props.reduction - Projected impact reduction rate (e.g. "30%").
 * @param {string} [props.eta] - Time remaining before anomaly reaches critical threshold.
 * @param {"info"|"danger"|"warning"} [props.variant="info"] - Theme styling variant.
 * @returns {React.ReactElement} The rendered PredictionCard.
 */
export default React.memo(function PredictionCard({
  location,
  badgeText,
  metricLabel,
  probability,
  action,
  reduction,
  eta,
  variant = "info", // "danger", "warning", "info"
}) {
  return (
    <div 
      className={`prediction-card prediction-card--${variant}`}
    >
      <div className="prediction-card__header">
        <span className="prediction-card__location">{location}</span>
        <span className="prediction-card__severity">{badgeText}</span>
      </div>
      <div className="prediction-card__metric">
        <span className="prediction-card__metric-label">{metricLabel}</span>
        <div className="prediction-card__prob-row">
          <span className="prediction-card__prob-value">{probability}%</span>
          <ProgressBar
            value={probability}
            variant={variant}
            barClass="prediction-bar"
          />
        </div>
      </div>
      <div className="prediction-card__details">
        {eta && (
          <div className="prediction-detail">
            <span className="prediction-detail__label">ETA</span>
            <span className="prediction-detail__value">{eta}</span>
          </div>
        )}
        <div className="prediction-detail">
          <span className="prediction-detail__label">ACTION</span>
          <span className="prediction-detail__value">{action}</span>
        </div>
        <div className="prediction-detail">
          <span className="prediction-detail__label">REDUCTION</span>
          <span className="prediction-detail__value prediction-detail__value--accent">
            {reduction}
          </span>
        </div>
      </div>
    </div>
  );
});
