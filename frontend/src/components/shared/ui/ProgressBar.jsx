import React from "react";

/**
 * ProgressBar — Horizontal progression layout representing metrics up to a max value.
 *
 * Renders a progress container with appropriate ARIA roles and computed percentage widths.
 * Clamps input values to a minimum of 0 and a maximum of 100%.
 *
 * @param {Object} props
 * @param {number} props.value - The current fill value of the progress bar.
 * @param {number} [props.max=100] - The ceiling value representing 100%.
 * @param {"info"|"danger"|"warning"|"success"} [props.variant="info"] - Color theme variant.
 * @param {string} [props.className=""] - Additional class name for container custom styling.
 * @param {string} [props.barClass="progress-bar"] - Base CSS prefix for styling structure.
 * @returns {React.ReactElement} The rendered ProgressBar component.
 */
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
