import { memo } from "react";
import { THRESHOLDS } from "../../../constants/dashboardConstants";
import { ResponsiveContainer, AreaChart, Area, YAxis, Tooltip } from "recharts";
import Card from "../../shared/ui/Card";
import Button from "../../shared/ui/Button";

// Historical dummy data for risk trend
const RISK_TREND_DATA = [
  { time: "19:00", risk: 38 },
  { time: "19:15", risk: 42 },
  { time: "19:30", risk: 50 },
  { time: "19:45", risk: 68 },
  { time: "20:00", risk: 62 },
  { time: "20:15", risk: 55 },
  { time: "20:30", risk: 52 }
];

export default memo(function RiskConfidencePanel({ dashboard, isConnected, loading, error, onRetry }) {
  if (loading) {
    return (
      <Card className="risk-confidence-card skeleton" id="risk-confidence-panel" aria-label="Loading operational risk insights">
        <div className="skeleton-box" style={{ width: "160px", height: "14px", marginBottom: "16px" }}></div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "20px 0" }}>
          <div className="skeleton-box" style={{ width: "90px", height: "90px", borderRadius: "50%" }}></div>
          <div className="skeleton-box" style={{ width: "70%", height: "12px" }}></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        title="Operational Risk Meter"
        icon="⚠️"
        className="risk-confidence-card"
        id="risk-confidence-panel"
      >
        <div className="card__body">
          <div className="panel-error-card" role="alert">
            <span className="panel-error-card__icon" aria-hidden="true">⚠️</span>
            <div className="panel-error-card__content">
              <h3 className="panel-error-card__title">Telemetry Offline</h3>
              <p className="panel-error-card__message">Cannot calculate operational risk score.</p>
            </div>
            {onRetry && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={onRetry}
                ariaLabel="Retry loading risk insights"
              >
                Retry
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  const gates = dashboard?.gates || [];
  const inventory = dashboard?.inventory || [];
  const staff = dashboard?.staff || [];

  // --- Calculate Risk Score ---
  const avgDensity = gates.length > 0
    ? gates.reduce((sum, g) => sum + g.crowd_density, 0) / gates.length
    : 0;

  const avgWait = gates.length > 0
    ? gates.reduce((sum, g) => sum + g.wait_time, 0) / gates.length
    : 0;
  const waitRisk = Math.min(100, (avgWait / 20) * 100);

  const lowInventoryCount = inventory.filter((i) => i.quantity < THRESHOLDS.INVENTORY.LOW).length;
  const totalInventoryCount = inventory.length || 1;
  const inventoryRisk = Math.min(100, (lowInventoryCount / totalInventoryCount) * 100 * 3);

  const availableStaff = staff.filter((s) => s.status === "Available").length;
  const totalStaff = staff.length || 1;
  const staffRisk = (1 - (availableStaff / totalStaff)) * 100;

  let riskScore = 0;
  if (isConnected) {
    riskScore = Math.round(
      (avgDensity * 0.3) +
      (waitRisk * 0.3) +
      (inventoryRisk * 0.2) +
      (staffRisk * 0.2)
    );
    riskScore = Math.max(0, Math.min(100, riskScore));
  } else {
    riskScore = 100;
  }

  let riskLevel = "LOW";
  let riskColorClass = "success";
  if (riskScore >= 75) {
    riskLevel = "HIGH";
    riskColorClass = "danger";
  } else if (riskScore >= 40) {
    riskLevel = "MEDIUM";
    riskColorClass = "warning";
  }

  // --- Three Short Bullet Insights Only ---
  const insights = [];
  
  if (avgWait > 12) {
    insights.push(`• Gate delays elevated (${Math.round(avgWait)}m avg)`);
  } else {
    insights.push("• Gate flow rates stable");
  }

  if (lowInventoryCount > 0) {
    insights.push(`• Concession items low at ${lowInventoryCount} stands`);
  } else {
    insights.push("• Concession stock healthy");
  }

  if (availableStaff < totalStaff / 2) {
    insights.push("• Shift staffing below target ratio");
  } else {
    insights.push("• Shift staff response deployed");
  }

  // Ensure exactly three insights
  const finalInsights = insights.slice(0, 3);

  return (
    <Card
      title="Operational Risk Meter"
      icon="📊"
      className="risk-confidence-card"
      id="risk-confidence-panel"
    >
      <div className="card__body risk-meter-body-simplified">
        <div className="risk-gauge-and-insights">
          {/* Risk Circular Gauge */}
          <div className="gauge-block-single">
            <div className="gauge-ring-wrapper-large" role="img" aria-label={`Operational risk score: ${riskScore}%, Level: ${riskLevel}`}>
              <svg viewBox="0 0 36 36" className="circular-chart circular-chart--large" aria-hidden="true">
                <path className="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {isConnected && (
                  <path className={`circle stroke-${riskColorClass}`}
                    strokeDasharray={`${riskScore}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                )}
              </svg>
              <div className="gauge-ring-val-large">
                <span className="gauge-number-large">{riskScore}%</span>
                <span className={`gauge-level-label text-${riskColorClass}`}>{riskLevel}</span>
              </div>
            </div>
          </div>

          {/* Three Short Bullet Insights */}
          <div className="risk-insights-panel">
            <span className="risk-insights-title">CORE INSIGHTS</span>
            <ul className="risk-insights-list">
              {finalInsights.map((insight, idx) => (
                <li key={idx} className="risk-insight-bullet">{insight}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Risk Trend Sparkline Chart */}
        <div className="risk-trend-chart-container">
          <span className="risk-trend-title">RISK TREND ANALYSIS</span>
          <div style={{ width: "100%", height: "55px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={RISK_TREND_DATA} margin={{ top: 5, right: 5, left: -45, bottom: 0 }}>
                <YAxis domain={[0, 100]} hide />
                <Tooltip contentStyle={{ background: "#111827", borderColor: "#1f2937", borderRadius: "4px", fontSize: "10px" }} />
                <Area 
                  type="monotone" 
                  dataKey="risk" 
                  stroke={riskScore >= 75 ? "#ef4444" : riskScore >= 40 ? "#f59e0b" : "#10b981"} 
                  fill={riskScore >= 75 ? "rgba(239, 68, 68, 0.05)" : riskScore >= 40 ? "rgba(245, 158, 11, 0.05)" : "rgba(16, 185, 129, 0.05)"} 
                  strokeWidth={1.5} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
});
