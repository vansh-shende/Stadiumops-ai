import { memo } from "react";
import MetricCard from "../../shared/ui/MetricCard";
import { THRESHOLDS } from "../../../constants/dashboardConstants";

export default memo(function KPIRow({ data, liveAlerts, isConnected, loading }) {
  if (loading) {
    return (
      <section className="kpi-row" id="kpi-row" aria-label="Key Performance Indicators Loading">
        {[...Array(6)].map((_, i) => (
          <div className="kpi-card skeleton" key={i}>
            <div className="kpi-card__header" style={{ borderBottom: "none" }}>
              <div className="skeleton-box" style={{ width: "20px", height: "20px", borderRadius: "50%" }}></div>
              <div className="skeleton-box" style={{ width: "40px", height: "10px" }}></div>
            </div>
            <div className="skeleton-box" style={{ width: "60px", height: "24px", margin: "8px 0" }}></div>
            <div className="skeleton-box" style={{ width: "100%", height: "8px" }}></div>
          </div>
        ))}
      </section>
    );
  }

  const gates = data?.gates || [];
  const inventory = data?.inventory || [];
  const staff = data?.staff || [];
  const alerts = liveAlerts?.alerts || [];

  const avgDensity = gates.length > 0
    ? Math.round(gates.reduce((sum, g) => sum + g.crowd_density, 0) / gates.length)
    : 0;

  const avgWait = gates.length > 0
    ? Math.round(gates.reduce((sum, g) => sum + g.wait_time, 0) / gates.length)
    : 0;

  const lowInventoryCount = inventory.filter((i) => i.quantity < THRESHOLDS.INVENTORY.LOW).length;
  const availableStaff = staff.filter((s) => s.status === "Available").length;
  const totalStaff = staff.length;
  const criticalAlertCount = alerts.filter((a) => a.startsWith("[CRITICAL]")).length;

  let healthScore = 100;
  if (!isConnected) {
    healthScore = 0;
  } else {
    healthScore -= Math.min(25, criticalAlertCount * 5);
    const warningAlertsCount = alerts.filter((a) => a.startsWith("[WARNING]")).length;
    healthScore -= Math.min(15, warningAlertsCount * 3);
    const highDensityGates = gates.filter((g) => g.crowd_density >= THRESHOLDS.DENSITY.MEDIUM).length;
    healthScore -= Math.min(16, highDensityGates * 4);
    const highWaitGates = gates.filter((g) => g.wait_time > THRESHOLDS.WAIT.MEDIUM).length;
    healthScore -= Math.min(16, highWaitGates * 4);
    const lowInventoryItems = inventory.filter((i) => i.quantity < THRESHOLDS.INVENTORY.LOW).length;
    healthScore -= Math.min(10, lowInventoryItems * 2);
    healthScore = Math.max(0, Math.min(100, healthScore));
  }

  const kpis = [
    {
      id: "crowd-density",
      label: "Crowd Density",
      value: `${avgDensity}%`,
      icon: "👥",
      variant: avgDensity >= THRESHOLDS.DENSITY.MEDIUM ? "danger" : avgDensity >= THRESHOLDS.DENSITY.LOW ? "warning" : "success",
      statusLabel: avgDensity >= THRESHOLDS.DENSITY.MEDIUM ? "CRIT" : avgDensity >= THRESHOLDS.DENSITY.LOW ? "ELEV" : "OPTM",
      trend: "+2.4%",
      trendDirection: "up",
      trendVariant: "warning"
    },
    {
      id: "avg-wait",
      label: "Avg Wait Time",
      value: `${avgWait}m`,
      icon: "⏱",
      variant: avgWait > THRESHOLDS.WAIT.MEDIUM ? "danger" : avgWait > THRESHOLDS.WAIT.LOW ? "warning" : "success",
      statusLabel: avgWait > THRESHOLDS.WAIT.MEDIUM ? "DLAY" : "NOMN",
      trend: "-1.5m",
      trendDirection: "down",
      trendVariant: "success"
    },
    {
      id: "low-inventory",
      label: "Low Inventory",
      value: `${lowInventoryCount}`,
      icon: "📦",
      variant: lowInventoryCount > 3 ? "danger" : lowInventoryCount > 0 ? "warning" : "success",
      statusLabel: lowInventoryCount > 3 ? "REPL" : lowInventoryCount > 0 ? "LOW" : "STCK",
      trend: lowInventoryCount > 0 ? "+1" : "0",
      trendDirection: lowInventoryCount > 0 ? "up" : "neutral",
      trendVariant: lowInventoryCount > 0 ? "warning" : "success"
    },
    {
      id: "active-staff",
      label: "Available Staff",
      value: `${availableStaff}/${totalStaff}`,
      icon: "🧑‍💼",
      variant: availableStaff === 0 ? "danger" : availableStaff >= totalStaff / 2 ? "success" : "warning",
      statusLabel: availableStaff < 3 ? "SHRT" : "STBY",
      trend: "0%",
      trendDirection: "neutral",
      trendVariant: "neutral"
    },
    {
      id: "critical-alerts",
      label: "Critical Alerts",
      value: `${criticalAlertCount}`,
      icon: "🚨",
      variant: criticalAlertCount > 0 ? "danger" : "success",
      statusLabel: criticalAlertCount > 0 ? "ACTN" : "CLEA",
      trend: criticalAlertCount > 0 ? `+${criticalAlertCount}` : "0",
      trendDirection: criticalAlertCount > 0 ? "up" : "neutral",
      trendVariant: criticalAlertCount > 0 ? "danger" : "success"
    },
    {
      id: "health-score",
      label: "System Health",
      value: `${healthScore}%`,
      icon: "🛡️",
      variant: healthScore >= 85 ? "success" : healthScore >= 60 ? "warning" : "danger",
      statusLabel: healthScore >= 85 ? "STBL" : "DEGR",
      trend: healthScore === 100 ? "0%" : "-2.5%",
      trendDirection: healthScore === 100 ? "neutral" : "down",
      trendVariant: healthScore === 100 ? "success" : "danger"
    }
  ];

  return (
    <section className="kpi-row" id="kpi-row" aria-label="Key Performance Indicators">
      {kpis.map((kpi) => (
        <MetricCard
          key={kpi.id}
          id={`kpi-${kpi.id}`}
          label={kpi.label}
          value={kpi.value}
          icon={kpi.icon}
          variant={kpi.variant}
          statusLabel={kpi.statusLabel}
          trend={kpi.trend}
          trendDirection={kpi.trendDirection}
          trendVariant={kpi.trendVariant}
        />
      ))}
    </section>
  );
});
