import React from "react";

export default React.memo(function ProgressBar({
  value,
  max = 100,
  variant = "info", // "info", "danger", "warning", "success"
  className = "",
  barClass = "progress-bar",
}) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  
  return (
    <div 
      className={`${barClass} ${className}`.trim()}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        className={`${barClass}__fill ${barClass}__fill--${variant}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
});
