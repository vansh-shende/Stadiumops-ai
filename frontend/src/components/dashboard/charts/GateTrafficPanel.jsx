import { useState, memo } from "react";
import { densityTier, waitTier } from "../../../utils/helpers";
import { THRESHOLDS } from "../../../constants/dashboardConstants";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import Card from "../../shared/ui/Card";
import Button from "../../shared/ui/Button";

// Historical dummy data for crowd density and wait times trends
const TREND_DATA = [
  { time: "19:00", crowd: 45, wait: 8 },
  { time: "19:15", crowd: 52, wait: 11 },
  { time: "19:30", crowd: 68, wait: 14 },
  { time: "19:45", crowd: 80, wait: 19 },
  { time: "20:00", crowd: 74, wait: 17 },
  { time: "20:15", crowd: 65, wait: 12 },
  { time: "20:30", crowd: 60, wait: 10 }
];

export default memo(function GateTrafficPanel({ gates = [], loading, error, onRetry }) {
  const [activeTab, setActiveTab] = useState("crowd");
  const hasData = gates && gates.length > 0;

  return (
    <Card
      title="Gate Traffic Control"
      icon="🚪"
      id="gate-traffic-panel"
    >
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
              <Button
                variant="secondary"
                size="sm"
                onClick={onRetry}
                ariaLabel="Retry loading gate traffic"
              >
                Retry
              </Button>
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
                    role="region"
                    aria-label={`${gate.gate_name}: ${gate.crowd_density}% density, ${gate.wait_time} minute wait`}
                  >
                    <div className="gate-minimal-card__header">
                      <span className="gate-minimal-card__name">
                        {gate.gate_name.split(" - ")[0]}
                      </span>
                      <span className={`status-badge status-badge--${waitColor}`}>
                        {isCritical && <span className="status-badge-pulse" aria-hidden="true"></span>}
                        {gate.wait_time > THRESHOLDS.WAIT.MEDIUM ? "DELAYED" : "NOMINAL"}
                      </span>
                    </div>
                    
                    <div className="gate-minimal-card__time">
                      {gate.wait_time}<span className="gate-minimal-card__unit">m</span>
                    </div>
                    
                    <div className="gate-minimal-card__progress-wrap">
                      <div
                        className="gate-minimal-card__progress-bar"
                        role="progressbar"
                        aria-valuenow={gate.crowd_density}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-label={`Crowd density: ${gate.crowd_density}%`}
                      >
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
                <div className="trends-chart-tabs" role="tablist" aria-label="Operational trend views">
                  <Button 
                    variant=""
                    className={`trends-tab-btn ${activeTab === "crowd" ? "active" : ""}`}
                    onClick={() => setActiveTab("crowd")}
                    ariaLabel="Show crowd density trend"
                  >
                    CROWD DENSITY
                  </Button>
                  <Button 
                    variant=""
                    className={`trends-tab-btn ${activeTab === "wait" ? "active" : ""}`}
                    onClick={() => setActiveTab("wait")}
                    ariaLabel="Show wait times trend"
                  >
                    WAIT TIMES
                  </Button>
                </div>
              </div>

              <div className="trends-chart-body" style={{ width: "100%", height: "130px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={TREND_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
    </Card>
  );
});
