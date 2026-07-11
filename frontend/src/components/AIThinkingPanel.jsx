/**
 * =========================================================
 *  StadiumOps AI — AI Thinking Panel (Feature 1)
 * =========================================================
 *
 *  Animated AI Commander widget that replaces the static card.
 *  Shows real-time AI state transitions with smooth animations:
 *    MONITORING → ANALYZING → PREDICTING → DECISION_READY → DEPLOYING
 *
 *  Features:
 *    - Scanning animation with rotating ring
 *    - Typing animation for AI responses
 *    - Confidence ring (SVG arc)
 *    - Next scan countdown
 *    - Estimated impact
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { classifyAlert, parseAlert } from "../utils/helpers";
import { useSimulation } from "../context/SimulationContext";
const AI_STATES = [
  { key: "MONITORING", label: "Monitoring", color: "var(--color-success)", icon: "◉" },
  { key: "ANALYZING", label: "Analyzing", color: "var(--color-warning)", icon: "◎" },
  { key: "RISK_MODELING", label: "Risk Modeling", color: "var(--color-info)", icon: "◈" },
  { key: "GENERATING_PLAN", label: "Generating Plan", color: "var(--color-info)", icon: "◆" },
  { key: "DEPLOYING", label: "Deploying", color: "var(--color-danger)", icon: "▶" },
];
function useTypingAnimation(text, speed = 18) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const prevTextRef = useRef("");

  useEffect(() => {
    if (text === prevTextRef.current) return;
    prevTextRef.current = text;
    if (!text) { setDisplayedText(""); return; }
    setIsTyping(true);
    setDisplayedText("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayedText, isTyping };
}

export default function AIThinkingPanel({ liveAlerts, lastUpdated, loading, error, onRetry }) {
  const [countdown, setCountdown] = useState(10);
  const [aiPhase, setAiPhase] = useState(0);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [scanAngle, setScanAngle] = useState(0);
  const { activeSimulation, isSimulating } = useSimulation();

  // Countdown timer synced with polls
  useEffect(() => {
    setCountdown(10);
  }, [lastUpdated]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 10 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Scan animation
  useEffect(() => {
    const frame = setInterval(() => {
      setScanAngle((a) => (a + 2) % 360);
    }, 30);
    return () => clearInterval(frame);
  }, []);

  // AI Phase cycling synchronized with countdown
  useEffect(() => {
    if (isSimulating) return;

    if (loading) {
      setAiPhase(0);
      return;
    }

    const alerts = liveAlerts?.alerts || [];
    const hasCritical = alerts.some((a) => a.startsWith("[CRITICAL]"));
    if (hasCritical) {
      setAiPhase(4); // Keep in Deploying
      return;
    }

    const isProcessing = liveAlerts?.status === "processing";
    if (isProcessing) {
      setAiPhase(1); // Keep in Analyzing
      return;
    }

    // Map 10s countdown to 5 sequential phases
    let phase = 0;
    if (countdown >= 9) phase = 0;
    else if (countdown >= 7) phase = 1;
    else if (countdown >= 5) phase = 2;
    else if (countdown >= 3) phase = 3;
    else phase = 4;

    setAiPhase(phase);
  }, [countdown, liveAlerts, loading, isSimulating]);

  // Override AI state during simulation
  useEffect(() => {
    if (isSimulating && activeSimulation) {
      const stateIdx = AI_STATES.findIndex(s => s.key === activeSimulation.aiState);
      if (stateIdx >= 0) setAiPhase(stateIdx);
    }
  }, [isSimulating, activeSimulation]);

  const currentState = AI_STATES[aiPhase] || AI_STATES[0];

  // Extract directive
  const alertsList = liveAlerts?.alerts || [];
  const latestAlert = isSimulating ? activeSimulation?.directive : alertsList[0];
  const parsed = latestAlert ? parseAlert(latestAlert) : null;
  const level = latestAlert ? classifyAlert(latestAlert) : "info";

  const { displayedText, isTyping } = useTypingAnimation(
    parsed?.message || "All systems operating within normal parameters. Continuous monitoring active."
  );

  // Confidence calculation
  const confidenceScore = liveAlerts?.anomalyCount !== undefined
    ? Math.max(70, 98 - (liveAlerts.anomalyCount * 2))
    : 98;
  const confidenceForDisplay = isSimulating ? Math.max(55, 95 - (activeSimulation?.riskOverride || 0) * 0.4) : confidenceScore;

  // SVG confidence ring
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (confidenceForDisplay / 100) * circumference;

  // Estimated impact
  const getEstimatedImpact = (msg) => {
    if (!msg) return "System Load: Balanced | Flow: Nominal";
    if (msg.includes("Gate") || msg.includes("crowd")) return "Est. Latency: -15% | Sector: Rebalancing";
    if (msg.includes("Inventory") || msg.includes("Concession")) return "Stock Risk: Mitigated | Delay: 0m";
    return "Operations: Optimizing | Capacity: Stable";
  };

  const evaluationRules = [
    { rule: "Wait Time Threshold Check", result: "Gate wait times analyzed; critical flags at hotspot gates.", level: "warning" },
    { rule: "Crowd Density Distribution", result: "Average density calculated. Peak capacity zones identified.", level: "warning" },
    { rule: "Concession Supply Status", result: "Concession stocks verified; replenishment alerts queued.", level: "info" },
    { rule: "Staff Logistics Ratios", result: "Active staff assignment efficiency calculated at optimal.", level: "success" },
  ];

  return (
    <article
      className={`card ai-thinking-panel ${isSimulating ? "ai-thinking-panel--simulating" : ""}`}
      id="ai-thinking-panel"
      tabIndex="0"
      aria-label="AI Commander Thinking Panel"
    >
      {/* Header */}
      <div className="card__header ai-thinking-header">
        <div className="ai-thinking-title-group">
          <div className="ai-brain-icon" aria-hidden="true">
            <svg viewBox="0 0 100 100" className="ai-scan-ring">
              <circle cx="50" cy="50" r="42" className="ai-scan-ring__track" />
              <circle
                cx="50" cy="50" r="42"
                className="ai-scan-ring__sweep"
                style={{ transform: `rotate(${scanAngle}deg)`, transformOrigin: "50% 50%" }}
              />
              <circle cx="50" cy="50" r="28" className="ai-scan-ring__inner" />
            </svg>
            <span className="ai-brain-icon__emoji">🧠</span>
          </div>
          <div>
            <h2 className="card__title">AI Tactical Commander</h2>
            <span className="ai-engine-label">Gemini Engine v2.0</span>
          </div>
        </div>

        <div className="ai-thinking-header-badges">
          {/* AI State Badge */}
          <div className="ai-state-badge" style={{ "--state-color": currentState.color }}>
            <span className="ai-state-badge__dot" />
            <span className="ai-state-badge__label">{currentState.label}</span>
          </div>
          {/* Countdown */}
          {!loading && !error && (
            <div className="scan-countdown-badge" aria-label={`Next scan in ${countdown} seconds`}>
              <svg viewBox="0 0 24 24" width="12" height="12" className="countdown-icon">
                <circle cx="12" cy="12" r="10" fill="none" stroke="var(--color-info)" strokeWidth="2" opacity="0.3" />
                <circle
                  cx="12" cy="12" r="10"
                  fill="none" stroke="var(--color-info)" strokeWidth="2"
                  strokeDasharray={`${(countdown / 10) * 62.8} 62.8`}
                  strokeLinecap="round"
                  style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dasharray 1s linear" }}
                />
              </svg>
              {countdown}s
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="card__body ai-thinking-body">
        {loading ? (
          <div className="ai-loading-state">
            <div className="ai-loading-pulse" />
            <span>Initializing AI subsystems…</span>
          </div>
        ) : error ? (
          <div className="panel-error-card" role="alert">
            <span className="panel-error-card__icon" aria-hidden="true">⚠️</span>
            <div className="panel-error-card__content">
              <h3 className="panel-error-card__title">Directives Offline</h3>
              <p className="panel-error-card__message">{error}</p>
            </div>
            {onRetry && (
              <button className="btn btn--secondary btn--xs" onClick={onRetry}>Retry</button>
            )}
          </div>
        ) : (
          <>
            {/* State Progress Steps */}
            <div className="ai-state-steps">
              {AI_STATES.map((state, idx) => (
                <div
                  key={state.key}
                  className={`ai-state-step ${idx <= aiPhase ? "ai-state-step--active" : ""} ${idx === aiPhase ? "ai-state-step--current" : ""}`}
                >
                  <span className="ai-state-step__dot" />
                  <span className="ai-state-step__label">{state.label}</span>
                </div>
              ))}
            </div>

            {/* Metrics Row */}
            <div className="ai-metrics-row">
              {/* Confidence Ring */}
              <div className="ai-confidence-block">
                <svg viewBox="0 0 100 100" className="ai-confidence-svg">
                  <circle cx="50" cy="50" r="40" className="ai-confidence-track" />
                  <circle
                    cx="50" cy="50" r="40"
                    className="ai-confidence-fill"
                    style={{
                      strokeDasharray: circumference,
                      strokeDashoffset: strokeDashoffset,
                      stroke: confidenceForDisplay >= 80 ? "var(--color-success)" : confidenceForDisplay >= 60 ? "var(--color-warning)" : "var(--color-danger)"
                    }}
                  />
                </svg>
                <div className="ai-confidence-value">
                  <span className="ai-confidence-number">{Math.round(confidenceForDisplay)}</span>
                  <span className="ai-confidence-unit">%</span>
                </div>
                <span className="ai-confidence-label">CONFIDENCE</span>
              </div>

              {/* Impact + Scan Info */}
              <div className="ai-impact-block">
                <div className="ai-metric-cell">
                  <span className="ai-metric-cell__label">ESTIMATED IMPACT</span>
                  <span className="ai-metric-cell__value">{getEstimatedImpact(parsed?.message)}</span>
                </div>
                <div className="ai-metric-cell">
                  <span className="ai-metric-cell__label">NEXT SCAN</span>
                  <span className="ai-metric-cell__value ai-metric-cell__value--mono">{countdown}s remaining</span>
                </div>
                <div className="ai-metric-cell">
                  <span className="ai-metric-cell__label">ANOMALIES DETECTED</span>
                  <span className="ai-metric-cell__value ai-metric-cell__value--highlight">
                    {liveAlerts?.anomalyCount ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Directive Display with Typing */}
            <div className={`ai-directive-display ai-directive-display--${level}`}>
              <div className="ai-directive-header">
                <span className={`badge badge--${level}`}>{parsed ? parsed.tag : "NOMINAL"}</span>
                <span className="ai-directive-time">
                  {lastUpdated ? lastUpdated.toLocaleTimeString("en-US", { hour12: false }) : ""}
                </span>
              </div>
              <p className="ai-directive-message ai-typing-text">
                {displayedText}
                {isTyping && <span className="ai-cursor">|</span>}
              </p>
            </div>

            {/* Actions */}
            <div className="ai-commander-actions">
              <button
                className="btn btn--primary btn--sm"
                onClick={() => setShowReasonModal(true)}
                aria-label="View Reasoning details"
              >
                View Reasoning
              </button>
            </div>
          </>
        )}
      </div>

      {/* Simulation Overlay Badge */}
      {isSimulating && (
        <div className="simulation-active-badge">
          <span className="simulation-active-badge__dot" />
          SIMULATION ACTIVE
        </div>
      )}

      {/* Reasoning Modal */}
      {showReasonModal && (
        <div className="modal-overlay" onClick={() => setShowReasonModal(false)} role="dialog" aria-modal="true">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>AI Decision Logic & Evaluations</h3>
              <button className="modal-close" onClick={() => setShowReasonModal(false)} aria-label="Close modal">×</button>
            </div>
            <div className="modal-body">
              <p className="modal-subtitle">Directives generated using real-time FIFA 2026 telemetry rules:</p>
              <div className="logic-rule-list">
                {evaluationRules.map((rule, idx) => (
                  <div key={idx} className="logic-rule-item">
                    <div className="logic-rule-header">
                      <span className="logic-rule-name">{rule.rule}</span>
                      <span className={`status-dot status-dot--${rule.level === "warning" ? "warning" : rule.level === "danger" ? "danger" : "success"}`} />
                    </div>
                    <p className="logic-rule-desc">{rule.result}</p>
                  </div>
                ))}
              </div>
              <div className="logic-modal-footer">
                <span>Evaluated Confidence Score: <strong>{Math.round(confidenceForDisplay)}%</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
