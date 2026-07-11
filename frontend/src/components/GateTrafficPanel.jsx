import { useState } from "react";
import { densityTier, waitTier } from "../utils/helpers";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

// Historical dummy data for crowd density and wait times trends
const trendData = [
  { time: "19:00", crowd: 45, wait: 8 },
  { time: "19:15", crowd: 52, wait: 11 },
  { time: "19:30", crowd: 68, wait: 14 },
  { time: "19:45", crowd: 80, wait: 19 },
  { time: "20:00", crowd: 74, wait: 17 },
  { time: "20:15", crowd: 65, wait: 12 },
  { time: "20:30", crowd: 60, wait: 10 }
];

export default function GateTrafficPanel({ gates = [], loading, error, onRetry }) {
  const [activeTab, setActiveTab] = useState("crowd");
  const hasData = gates && gates.length > 0;

  return (
    <article 
      className="card" 
      id="gate-traffic-panel" 
      tabIndex="0" 
      aria-label="Gate Flow and Trend Telemetry"
    >
      <div className="card__header">
        <h2 className="card__title">
          <span className="card__title-icon">🚪</span>
          Gate Traffic Control
        </h2>
      </div>
      
      <div className="card__body">
        {loading ? (
          <div className="ops-card-grid" aria-label="Loading gate traffic data">
            {[...Array(6)].map((_, i) => (
              <div className="ops-card skeleton" key={i}>
                <div className="skeleton-box" style={{ width: "40%", height: "16px", marginBottom: "8px" }}></div>
                <div className="skeleton-box" style={{ width: "100%", height: "24px" }}></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="panel-error-card" role="alert">
            <span className="panel-error-card__icon" aria-hidden="true">⚠️</span>
            <div className="panel-error-card__content">
              <h3 className="panel-error-card__title">Telemetry Offline</h3>
              <p className="panel-error-card__message">{error}</p>
            </div>
            {onRetry && (
              <button 
                className="btn btn--secondary btn--xs" 
                onClick={onRetry}
                aria-label="Retry loading gate traffic"
              >
                Retry
              </button>
            )}
          </div>
        ) : !hasData ? (
          <div className="empty-state">
            <div className="empty-state__icon" aria-hidden="true">🚪</div>
            <div className="empty-state__message">No gate traffic records available</div>
          </div>
        ) : (
          <div className="gate-panel-content">
            {/* Grid of simplified Gate Cards */}
            <div className="gate-card-grid" id="gate-traffic-body">
              {gates.map((gate) => {
                const dTier = densityTier(gate.crowd_density);
                const wTier = waitTier(gate.wait_time);
                const densityColor = dTier === "high" ? "danger" : dTier === "medium" ? "warning" : "success";
                const waitColor = wTier === "high" ? "danger" : wTier === "medium" ? "warning" : "success";
                const isCritical = wTier === "high" || dTier === "high";

                return (
                  <div 
                    key={gate.id} 
                    className={`gate-minimal-card gate-minimal-card--${waitColor}`} 
                    tabIndex="0"
                    aria-label={`${gate.gate_name}: wait time ${gate.wait_time} minutes`}
                  >
                    <div className="gate-minimal-card__header">
                      <span className="gate-minimal-card__name">
                        {gate.gate_name.split(" - ")[0]}
                      </span>
                      <span className={`status-badge status-badge--${waitColor}`}>
                        {isCritical && <span className="status-badge-pulse"></span>}
                        {gate.wait_time > 15 ? "DELAYED" : "NOMINAL"}
                      </span>
                    </div>
                    
                    <div className="gate-minimal-card__time">
                      {gate.wait_time}<span className="gate-minimal-card__unit">m</span>
                    </div>
                    
                    <div className="gate-minimal-card__progress-wrap">
                      <div className="gate-minimal-card__progress-bar">
                        <div
                          className={`gate-minimal-card__progress-fill gate-minimal-card__progress-fill--${densityColor}`}
                          style={{ width: `${gate.crowd_density}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recharts System Trend Charts */}
            <div className="gate-trends-chart-card">
              <div className="trends-chart-header">
                <span className="trends-chart-title">OPERATIONAL TRENDS</span>
                <div className="trends-chart-tabs">
                  <button 
                    className={`trends-tab-btn ${activeTab === "crowd" ? "active" : ""}`}
                    onClick={() => setActiveTab("crowd")}
                  >
                    CROWD DENSITY
                  </button>
                  <button 
                    className={`trends-tab-btn ${activeTab === "wait" ? "active" : ""}`}
                    onClick={() => setActiveTab("wait")}
                  >
                    WAIT TIMES
                  </button>
                </div>
              </div>

              <div className="trends-chart-body" style={{ width: "100%", height: "130px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="time" stroke="#4b5563" fontSize={9} tickLine={false} />
                    <YAxis stroke="#4b5563" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#111827", borderColor: "#1f2937", borderRadius: "4px" }} />
                    {activeTab === "crowd" ? (
                      <Area 
                        type="monotone" 
                        dataKey="crowd" 
                        stroke="#3b82f6" 
                        fill="rgba(59, 130, 246, 0.08)" 
                        strokeWidth={1.5} 
                      />
                    ) : (
                      <Area 
                        type="monotone" 
                        dataKey="wait" 
                        stroke="#ef4444" 
                        fill="rgba(239, 68, 68, 0.08)" 
                        strokeWidth={1.5} 
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
