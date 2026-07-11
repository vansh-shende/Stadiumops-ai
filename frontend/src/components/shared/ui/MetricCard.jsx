import React, { useState, useEffect, useRef } from "react";

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

export default React.memo(function MetricCard({
  id,
  label,
  value,
  icon,
  variant = "success", // "success", "warning", "danger"
  statusLabel,
  trend,
  trendDirection = "neutral", // "up", "down", "neutral"
  trendVariant = "success", // "success", "warning", "danger", "neutral"
  className = "",
}) {
  const trendSymbol = trendDirection === "up" ? "▲" : trendDirection === "down" ? "▼" : "■";

  return (
    <div 
      className={`kpi-minimal-card ${className}`.trim()} 
      id={id}
      tabIndex="0"
      aria-label={`${label} is ${value}, status: ${statusLabel}, trend: ${trend}`}
    >
      {/* 1. Header (Icon and Status Badge) */}
      <div className="kpi-minimal-card__header">
        <span className="kpi-minimal-card__icon" aria-hidden="true">{icon}</span>
        <span className={`kpi-minimal-card__badge kpi-minimal-card__badge--${variant}`}>
          <span className="kpi-status-dot-pulse" aria-hidden="true" />
          {statusLabel}
        </span>
      </div>

      {/* 2. Body (Number Value and Mini Sparkline) */}
      <div className="kpi-minimal-card__body">
        <span className="kpi-minimal-card__val">
          <AnimatedNumber value={value} />
        </span>
        <div className="kpi-minimal-card__viz">
          <MiniSparkline variant={variant} />
        </div>
      </div>

      {/* 3. Footer (Trend) */}
      <div className="kpi-minimal-card__footer">
        <span className={`kpi-minimal-card__trend kpi-minimal-card__trend--${trendVariant}`}>
          {trendSymbol} {trend}
        </span>
      </div>
    </div>
  );
});
