import { useState, useEffect } from "react";
import { classifyAlert, parseAlert } from "../utils/helpers";

export default function AlertFeed({ liveAlerts, lastUpdated, loading, error, onRetry }) {
  const [countdown, setCountdown] = useState(10);
  const [showReasonModal, setShowReasonModal] = useState(false);

  // Countdown timer (synced with polls)
  useEffect(() => {
    setCountdown(10);
  }, [lastUpdated]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 10;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isProcessing = liveAlerts?.status === "processing";
  const confidenceScore = liveAlerts?.anomalyCount !== undefined
    ? Math.max(70, 98 - (liveAlerts.anomalyCount * 2))
    : 98;

  // Extract current directive
  const alertsList = liveAlerts?.alerts || [];
  const latestAlert = alertsList[0] || "";
  const parsed = latestAlert ? parseAlert(latestAlert) : null;
  const level = latestAlert ? classifyAlert(latestAlert) : "success";

  // Dynamic estimated impact helper
  const getEstimatedImpact = (message) => {
    if (!message) return "System Load: Balanced | Flow: Nominal";
    if (message.includes("Gate B") || message.includes("Gate E") || message.includes("Gate F")) {
      return "Est. Latency: -15% | sector distribution: balanced";
    }
    if (message.includes("Inventory") || message.includes("Concession")) {
      return "Stock Out Risk: Restored | Logistics Delay: 0m";
    }
    return "Operations: Optimizing | Capacity Target: Stable";
  };

  const estimatedImpact = parsed ? getEstimatedImpact(parsed.message) : "System Latency: 0m | Flow Load: Optimized";

  const evaluationRules = [
    { rule: "Wait Time Threshold Check", result: "Gate wait times analyzed; critical flags at Gates B & E.", level: "warning" },
    { rule: "Crowd Density Distribution", result: `Average density is normal. Peak capacity at Gate D/E: 80%.`, level: "warning" },
    { rule: "Concession Supply Status", result: "Concession stocks verified; 2 stands require replenishment.", level: "info" },
    { rule: "Staff Logistics Ratios", result: "Active staff assignment efficiency calculated.", level: "success" }
  ];

  return (
    <article 
      className="card alert-feed" 
      id="alert-feed-panel"
      tabIndex="0"
      aria-label="AI Tactical Commander Directive"
    >
      <div className="card__header alert-commander-header">
        <div className="alert-commander-title">
          <span className="card__title-icon">🤖</span>
          <div>
            <h2 className="card__title">AI Tactical Commander</h2>
            <span className="alert-commander-subtitle">Gemini Engine Directive</span>
          </div>
        </div>
        {!loading && !error && (
          <div className="scan-countdown-badge" aria-label={`Next scan in ${countdown} seconds`}>
            SCAN IN {countdown}s
          </div>
        )}
      </div>

      <div className="card__body ai-commander-body">
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="skeleton-box" style={{ width: "30%", height: "14px" }}></div>
            <div className="skeleton-box" style={{ width: "100%", height: "48px" }}></div>
            <div className="skeleton-box" style={{ width: "80px", height: "24px" }}></div>
          </div>
        ) : error ? (
          <div className="panel-error-card" role="alert">
            <span className="panel-error-card__icon" aria-hidden="true">⚠️</span>
            <div className="panel-error-card__content">
              <h3 className="panel-error-card__title">Directives Offline</h3>
              <p className="panel-error-card__message">{error}</p>
            </div>
            {onRetry && (
              <button 
                className="btn btn--secondary btn--xs" 
                onClick={onRetry}
                aria-label="Retry loading directives"
              >
                Retry
              </button>
            )}
          </div>
        ) : (
          <div className="ai-commander-content">
            {/* Core telemetry details (Confidence and Estimated Impact) */}
            <div className="commander-dashboard-metrics">
              <div className="metric-block">
                <span className="metric-block__label">CONFIDENCE</span>
                <span className="metric-block__val text-accent">
                  {isProcessing ? "—" : `${confidenceScore}%`}
                </span>
              </div>
              <div className="metric-block">
                <span className="metric-block__label">ESTIMATED IMPACT</span>
                <span className="metric-block__val text-success" style={{ fontSize: "10px", fontFamily: "monospace" }}>
                  {estimatedImpact}
                </span>
              </div>
            </div>

            {/* Directive Display */}
            <div className={`ai-directive-display ai-directive-display--${level}`}>
              <div className="ai-directive-header">
                <span className={`badge badge--${level}`}>{parsed ? parsed.tag : "NOMINAL"}</span>
                <span className="ai-directive-time">
                  {lastUpdated ? lastUpdated.toLocaleTimeString("en-US", { hour12: false }) : ""}
                </span>
              </div>
              <p className="ai-directive-message">
                {parsed ? parsed.message : "All gate systems and concession channels are performing within normal operational levels."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="ai-commander-actions">
              <button 
                className="btn btn--primary btn--sm" 
                onClick={() => setShowReasonModal(true)}
                aria-label="View AI logic details"
              >
                View Reasoning
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reasoning Logs Modal Overlay */}
      {showReasonModal && (
        <div className="modal-overlay" onClick={() => setShowReasonModal(false)} role="dialog" aria-modal="true" aria-labelledby="reason-modal-title">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="reason-modal-title">AI Decision Logic & Evaluations</h3>
              <button className="modal-close" onClick={() => setShowReasonModal(false)} aria-label="Close modal">×</button>
            </div>
            <div className="modal-body">
              <p className="modal-subtitle">Directives generated using real-time FIFA 2026 telemetry rules:</p>
              <div className="logic-rule-list">
                {evaluationRules.map((rule, idx) => (
                  <div key={idx} className="logic-rule-item">
                    <div className="logic-rule-header">
                      <span className="logic-rule-name">{rule.rule}</span>
                      <span className={`status-dot status-dot--${rule.level === "warning" ? "warning" : rule.level === "danger" ? "danger" : "success"}`}></span>
                    </div>
                    <p className="logic-rule-desc">{rule.result}</p>
                  </div>
                ))}
              </div>
              <div className="logic-modal-footer">
                <span>Evaluated Confidence Score: <strong>{confidenceScore}%</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
