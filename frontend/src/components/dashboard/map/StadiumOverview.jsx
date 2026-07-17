import React, { useState } from "react";
import { densityTier, waitTier } from "../../../utils/helpers";
import { postGateAction } from "../../../services/api";
import { THRESHOLDS } from "../../../constants/dashboardConstants";
import Card from "../../shared/ui/Card";
import Button from "../../shared/ui/Button";
import StatusChip from "../../shared/ui/StatusChip";

const GATE_COORDS = {
  "Gate A - Main Entrance": { x: 120, y: 70, labelX: 80, labelY: 50 },
  "Gate B - North Stand": { x: 250, y: 50, labelX: 250, labelY: 30 },
  "Gate C - East Wing": { x: 380, y: 70, labelX: 420, labelY: 50 },
  "Gate D - South Stand": { x: 380, y: 210, labelX: 420, labelY: 230 },
  "Gate E - VIP Entrance": { x: 250, y: 230, labelX: 250, labelY: 265 },
  "Gate F - West Pavilion": { x: 120, y: 210, labelX: 80, labelY: 230 }
};

const CENTER_X = 250;
const CENTER_Y = 145;

export default React.memo(function StadiumOverview({
  gates = [],
  liveAlerts,
  isConnected,
  loading,
  error,
  onActionComplete
}) {
  const [selectedGate, setSelectedGate] = useState(null);
  const [submittingAction, setSubmittingAction] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  if (loading) {
    return (
      <Card className="stadium-overview-card skeleton" id="stadium-overview-panel">
        <div className="skeleton-box" style={{ width: "200px", height: "16px", marginBottom: "16px" }}></div>
        <div style={{ display: "flex", gap: "24px", height: "320px" }}>
          <div className="skeleton-box" style={{ flex: 1.5, height: "100%" }}></div>
          <div className="skeleton-box" style={{ flex: 1, height: "100%" }}></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        title="Stadium Map"
        icon="🏟️"
        className="stadium-overview-card"
        id="stadium-overview-panel"
      >
        <div className="card__body">
          <div className="panel-error-card">
            <span className="panel-error-card__icon" aria-hidden="true">⚠️</span>
            <div className="panel-error-card__content">
              <h3 className="panel-error-card__title">Offline</h3>
              <p className="panel-error-card__message">{error}</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const criticalAlertCount = liveAlerts?.anomalyCount || 0;

  const handleGateSelect = (gate) => {
    setSelectedGate(gate);
    setActionSuccess(null);
    setActionError(null);
  };

  const handleActionClick = async (action) => {
    if (!selectedGate) return;
    setSubmittingAction(action);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await postGateAction(selectedGate.gate_name, action);
      if (res.success) {
        setActionSuccess(res.message);
        if (onActionComplete) {
          onActionComplete();
        }
      } else {
        setActionError(res.error || "Failed to execute command.");
      }
    } catch (err) {
      setActionError(err.message || "Failed to execute command.");
    } finally {
      setSubmittingAction(null);
    }
  };
  
  let healthScore = 100;
  if (!isConnected) {
    healthScore = 0;
  } else {
    healthScore -= Math.min(25, criticalAlertCount * 5);
    const highDensityGates = gates.filter((g) => g.crowd_density >= THRESHOLDS.DENSITY.MEDIUM).length;
    healthScore -= Math.min(16, highDensityGates * 4);
    const highWaitGates = gates.filter((g) => g.wait_time > THRESHOLDS.WAIT.MEDIUM).length;
    healthScore -= Math.min(16, highWaitGates * 4);
    healthScore = Math.max(0, Math.min(100, healthScore));
  }

  return (
    <Card
      title="Operations Map"
      icon="🏟️"
      headerRight={<span className="digital-twin-badge">DIGITAL TWIN</span>}
      className="stadium-overview-card"
      id="stadium-overview-panel"
    >
      <div className="card__body stadium-hero-layout">
        {/* SVG Map Section */}
        <div className="stadium-map-section">
          <svg viewBox="0 0 500 300" className="stadium-svg" aria-hidden="true">
            <defs>
              <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(59,130,246,0.08)" />
                <stop offset="100%" stopColor="rgba(59,130,246,0)" />
              </radialGradient>
              <filter id="gateGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background ambient glow */}
            <circle cx={CENTER_X} cy={CENTER_Y} r="130" fill="url(#radarGlow)" />

            {/* Outer structure */}
            <rect x="90" y="40" width="320" height="200" rx="100" className="stadium-outer-ring" />
            <rect x="120" y="70" width="260" height="140" rx="70" className="stadium-inner-ring" />
            
            {/* Pitch */}
            <rect x="170" y="110" width="160" height="70" className="stadium-pitch" />
            <circle cx={CENTER_X} cy={CENTER_Y} r="20" className="stadium-pitch-center" />
            <line x1="250" y1="110" x2="250" y2="180" className="stadium-pitch-line" />

            {/* Radar sweep */}
            <g className="radar-sweep-group">
              <line
                x1={CENTER_X} y1={CENTER_Y}
                x2={CENTER_X + 120} y2={CENTER_Y}
                className="radar-sweep-line"
              />
              <circle cx={CENTER_X} cy={CENTER_Y} r="60" className="radar-ring radar-ring--1" />
              <circle cx={CENTER_X} cy={CENTER_Y} r="100" className="radar-ring radar-ring--2" />
            </g>

            {/* Data flow lines from gates to center */}
            {gates.map((gate) => {
              const coords = GATE_COORDS[gate.gate_name];
              if (!coords) return null;
              const dTier = densityTier(gate.crowd_density);
              const flowColor = dTier === "high" ? "var(--color-danger)" : dTier === "medium" ? "var(--color-warning)" : "var(--color-success)";
              return (
                <line
                  key={`flow-${gate.id}`}
                  x1={coords.x} y1={coords.y}
                  x2={CENTER_X} y2={CENTER_Y}
                  className="data-flow-line"
                  style={{ stroke: flowColor }}
                />
              );
            })}

            {/* Render gates */}
            {gates.map((gate) => {
              const coords = GATE_COORDS[gate.gate_name] || { x: 250, y: 150, labelX: 250, labelY: 150 };
              const dTier = densityTier(gate.crowd_density);
              const wTier = waitTier(gate.wait_time);
              const isCritical = dTier === "high" || wTier === "high";
              const isWarning = dTier === "medium" || wTier === "medium";
              let statusClass = "gate-status--ok";
              if (isCritical) statusClass = "gate-status--critical";
              else if (isWarning) statusClass = "gate-status--warning";

              return (
                <g
                  key={gate.id}
                  className={`gate-group ${statusClass}`}
                  filter="url(#gateGlow)"
                  onClick={() => handleGateSelect(gate)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleGateSelect(gate);
                    }
                  }}
                  tabIndex="0"
                  role="button"
                  aria-label={`Gate ${gate.gate_name.split(" - ")[0]}. Crowd density: ${gate.crowd_density} percent. Wait time: ${gate.wait_time} minutes.`}
                  style={{ cursor: "pointer", outline: "none" }}
                >
                  <circle cx={coords.x} cy={coords.y} r="18" className="gate-breathe-ring" />
                  {isCritical && (
                    <circle cx={coords.x} cy={coords.y} r="22" className="gate-pulse-circle" />
                  )}
                  <circle cx={coords.x} cy={coords.y} r="12" className="gate-node" />
                  <g className="gate-label-box">
                    <text x={coords.labelX} y={coords.labelY} className="gate-text-name" textAnchor="middle">
                      {gate.gate_name.split(" - ")[0]}
                    </text>
                    <text x={coords.labelX} y={coords.labelY + 12} className="gate-text-stats" textAnchor="middle">
                      {gate.crowd_density}% | {gate.wait_time}m
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Telemetry Sidebar */}
        <div className="stadium-telemetry-section">
          <div className="telemetry-block telemetry-block--accent">
            <span className="telemetry-label">🛡️ HEALTH</span>
            <span className={`telemetry-value text-${healthScore >= 80 ? "success" : healthScore >= 50 ? "warning" : "danger"}`}>
              {healthScore}%
            </span>
          </div>
          <div className="telemetry-block">
            <span className="telemetry-label">👥 CAPACITY</span>
            <span className="telemetry-value">64,820</span>
            <span className="telemetry-subtext">92.6%</span>
          </div>
          <div className="telemetry-block">
            <span className="telemetry-label">⚽ MATCH TIME</span>
            <span className="telemetry-value text-accent">74'</span>
            <span className="telemetry-subtext">2ND HALF</span>
          </div>
          <div className="telemetry-block">
            <span className="telemetry-label">⚠️ ANOMALIES</span>
            <span className={`telemetry-value ${criticalAlertCount > 0 ? "text-danger" : "text-success"}`}>
              {criticalAlertCount}
            </span>
          </div>
          <div className="telemetry-block">
            <span className="telemetry-label">⛅ WEATHER</span>
            <span className="telemetry-value">19°C</span>
          </div>
        </div>
      </div>

      {/* Sub-Telemetry Status Bar */}
      <div className="stadium-sub-telemetry">
        <div className="sub-telemetry-item">
          <span className="sub-telemetry-dot sub-telemetry-dot--active" />
          <span className="sub-telemetry-label">GPS NODES:</span>
          <span className="sub-telemetry-value">6/6 ONLINE</span>
        </div>
        <div className="sub-telemetry-item">
          <span className="sub-telemetry-dot sub-telemetry-dot--active" />
          <span className="sub-telemetry-label">CCTV ARRAY:</span>
          <span className="sub-telemetry-value">4 ACTIVE</span>
        </div>
        <div className="sub-telemetry-item">
          <span className="sub-telemetry-dot sub-telemetry-dot--active" />
          <span className="sub-telemetry-label">SYS LATENCY:</span>
          <span className="sub-telemetry-value">12ms</span>
        </div>
        <div className="sub-telemetry-item">
          <span className="sub-telemetry-dot sub-telemetry-dot--active" />
          <span className="sub-telemetry-label">DATASTREAM:</span>
          <span className="sub-telemetry-value">4.8 KB/s</span>
        </div>
        <div className="sub-telemetry-item">
          <span className="sub-telemetry-dot sub-telemetry-dot--active" />
          <span className="sub-telemetry-label">SAT-LINK:</span>
          <span className="sub-telemetry-value">SYNCED</span>
        </div>
      </div>

      {selectedGate && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedGate(null)}
          onKeyDown={(e) => { if (e.key === "Escape") setSelectedGate(null); }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="stadium-modal-title"
          aria-describedby="stadium-modal-desc"
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="stadium-modal-title">⚡ Operations Command — {selectedGate.gate_name.split(" - ")[0]}</h3>
              <button className="modal-close" onClick={() => setSelectedGate(null)} aria-label="Close command dialog">×</button>
            </div>
            <div className="modal-body" id="stadium-modal-desc">
              <div style={{ marginBottom: "16px" }}>
                <span className="telemetry-label">Status Overview:</span>
                <div style={{ display: "flex", gap: "16px", marginTop: "6px" }}>
                  <div className="telemetry-block" style={{ flex: 1, padding: "8px" }}>
                    <span className="telemetry-label">Density</span>
                    <span className={`telemetry-value text-${selectedGate.crowd_density >= THRESHOLDS.DENSITY.MEDIUM ? "danger" : selectedGate.crowd_density >= THRESHOLDS.DENSITY.LOW ? "warning" : "success"}`} style={{ fontSize: "18px" }}>
                      {selectedGate.crowd_density}%
                    </span>
                  </div>
                  <div className="telemetry-block" style={{ flex: 1, padding: "8px" }}>
                    <span className="telemetry-label">Wait Time</span>
                    <span className={`telemetry-value text-${selectedGate.wait_time >= THRESHOLDS.WAIT.MEDIUM ? "danger" : selectedGate.wait_time >= 10 ? "warning" : "success"}`} style={{ fontSize: "18px" }}>
                      {selectedGate.wait_time}m
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
                <span className="telemetry-label">Operational Commands:</span>
                
                <Button
                  variant="primary"
                  style={{ width: "100%", textAlign: "left", justifyContent: "flex-start", padding: "10px 16px" }}
                  onClick={() => handleActionClick("open_auxiliary")}
                  disabled={submittingAction}
                  ariaLabel={`Open auxiliary turnstiles for ${selectedGate.gate_name.split(" - ")[0]}`}
                >
                  {submittingAction === "open_auxiliary" ? "⏳ Opening Turnstiles..." : "🔓 Open Auxiliary Turnstiles"}
                </Button>

                <Button
                  variant="primary"
                  style={{ width: "100%", textAlign: "left", justifyContent: "flex-start", padding: "10px 16px", backgroundColor: "rgba(0, 242, 254, 0.1)", borderColor: "rgba(0, 242, 254, 0.4)", color: "var(--color-info)" }}
                  onClick={() => handleActionClick("deploy_stewards")}
                  disabled={submittingAction}
                  ariaLabel={`Deploy response stewards to ${selectedGate.gate_name.split(" - ")[0]}`}
                >
                  {submittingAction === "deploy_stewards" ? "⏳ Deploying Crew..." : "👥 Deploy Response Stewards"}
                </Button>

                <Button
                  variant="secondary"
                  style={{ 
                    width: "100%", textAlign: "left", justifyContent: "flex-start", padding: "10px 16px",
                    backgroundColor: selectedGate.wait_time === 99 ? "rgba(0, 245, 160, 0.1)" : "rgba(255, 0, 85, 0.1)",
                    borderColor: selectedGate.wait_time === 99 ? "rgba(0, 245, 160, 0.4)" : "rgba(255, 0, 85, 0.4)",
                    color: selectedGate.wait_time === 99 ? "var(--color-success)" : "var(--color-danger)"
                  }}
                  onClick={() => handleActionClick("toggle_lockdown")}
                  disabled={submittingAction}
                  ariaLabel={selectedGate.wait_time === 99 ? `Lift lockdown state for ${selectedGate.gate_name.split(" - ")[0]}` : `Activate lockdown for ${selectedGate.gate_name.split(" - ")[0]}`}
                >
                  {submittingAction === "toggle_lockdown" ? "⏳ Processing..." : selectedGate.wait_time === 99 ? "🔓 Lift Lockdown State" : "🚨 Activate Gate Lockdown"}
                </Button>
              </div>

              {actionSuccess && (
                <StatusChip variant="success" style={{ marginTop: "16px", display: "block" }}>
                  ✓ {actionSuccess}
                </StatusChip>
              )}

              {actionError && (
                <StatusChip variant="danger" style={{ marginTop: "16px", display: "block" }}>
                  ⚠ {actionError}
                </StatusChip>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
});
