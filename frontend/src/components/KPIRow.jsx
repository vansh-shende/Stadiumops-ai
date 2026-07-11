import { useState, useEffect, useRef, memo } from "react";

function AnimatedNumber({ value }) {
  const [displayVal, setDisplayVal] = useState(value);
  const prevValRef = useRef(value);

  useEffect(() => {
    const matchPrev = String(prevValRef.current).match(/\d+/);
    const matchNext = String(value).match(/\d+/);

    if (matchPrev && matchNext) {
      const start = parseInt(matchPrev[0], 10);
      const end = parseInt(matchNext[0], 10);

      if (start !== end) {
        let startTimestamp = null;
        const duration = 450;

        const step = (timestamp) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          const current = Math.round(start + progress * (end - start));
          const formatted = String(value).replace(/\d+/, current);
          setDisplayVal(formatted);

          if (progress < 1) {
            window.requestAnimationFrame(step);
          } else {
            prevValRef.current = value;
            setDisplayVal(value);
          }
        };

        window.requestAnimationFrame(step);
      } else {
        setDisplayVal(value);
      }
    } else {
      setDisplayVal(value);
      prevValRef.current = value;
    }
  }, [value]);

  return <span className="animated-metric">{displayVal}</span>;
}

function MiniSparkline({ variant = "success" }) {
  const paths = {
    success: "M0,15 L8,17 L16,9 L24,12 L32,4 L40,6",
    danger: "M0,6 L8,8 L16,14 L24,11 L32,18 L40,19",
    warning: "M0,12 L8,14 L16,8 L24,15 L32,10 L40,11"
  };
  const path = paths[variant] || paths.success;
  const color = variant === "danger" ? "var(--color-danger)" : variant === "warning" ? "var(--color-warning)" : "var(--color-success)";
  return (
    <svg width="40" height="20" viewBox="0 0 40 20" className="kpi-sparkline" aria-hidden="true">
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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

  const lowInventoryCount = inventory.filter((i) => i.quantity < 30).length;
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
    const highDensityGates = gates.filter((g) => g.crowd_density >= 80).length;
    healthScore -= Math.min(16, highDensityGates * 4);
    const highWaitGates = gates.filter((g) => g.wait_time > 15).length;
    healthScore -= Math.min(16, highWaitGates * 4);
    const lowInventoryItems = inventory.filter((i) => i.quantity < 30).length;
    healthScore -= Math.min(10, lowInventoryItems * 2);
    healthScore = Math.max(0, Math.min(100, healthScore));
  }

  const kpis = [
    {
      id: "crowd-density",
      label: "Crowd Density",
      value: `${avgDensity}%`,
      icon: "👥",
      variant: avgDensity >= 80 ? "danger" : avgDensity >= 50 ? "warning" : "success",
      statusLabel: avgDensity >= 80 ? "CRIT" : avgDensity >= 50 ? "ELEV" : "OPTM",
      trend: "+2.4%",
      trendDirection: "up",
      trendVariant: "warning"
    },
    {
      id: "avg-wait",
      label: "Avg Wait Time",
      value: `${avgWait}m`,
      icon: "⏱",
      variant: avgWait > 15 ? "danger" : avgWait > 5 ? "warning" : "success",
      statusLabel: avgWait > 15 ? "DLAY" : "NOMN",
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
      {kpis.map((kpi) => {
        const trendSymbol = kpi.trendDirection === "up" ? "▲" : kpi.trendDirection === "down" ? "▼" : "■";
        return (
          <div 
            className="kpi-minimal-card" 
            key={kpi.id} 
            id={`kpi-${kpi.id}`}
            tabIndex="0"
            aria-label={`${kpi.label} is ${kpi.value}, status: ${kpi.statusLabel}, trend: ${kpi.trend}`}
          >
            {/* 1. Header (Icon and Status Badge) */}
            <div className="kpi-minimal-card__header">
              <span className="kpi-minimal-card__icon" aria-hidden="true">{kpi.icon}</span>
              <span className={`kpi-minimal-card__badge kpi-minimal-card__badge--${kpi.variant}`}>
                <span className="kpi-status-dot-pulse" aria-hidden="true" />
                {kpi.statusLabel}
              </span>
            </div>

            {/* 2. Body (Number Value and Mini Sparkline) */}
            <div className="kpi-minimal-card__body">
              <span className="kpi-minimal-card__val">
                <AnimatedNumber value={kpi.value} />
              </span>
              <div className="kpi-minimal-card__viz">
                <MiniSparkline variant={kpi.variant} />
              </div>
            </div>

            {/* 3. Footer (Trend) */}
            <div className="kpi-minimal-card__footer">
              <span className={`kpi-minimal-card__trend kpi-minimal-card__trend--${kpi.trendVariant}`}>
                {trendSymbol} {kpi.trend}
              </span>
            </div>
          </div>
        );
      })}
    </section>
  );
});
