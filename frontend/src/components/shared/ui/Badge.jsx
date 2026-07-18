import React from "react";

/**
 * Badge — Reusable status/numerical marker pill.
 *
 * Optionally renders a status dot before the text label for emphasis.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Inside label content of the badge.
 * @param {"info"|"danger"|"warning"|"success"} [props.variant="info"] - Style theme variant.
 * @param {string} [props.className=""] - Additional class names for styling wrapper.
 * @param {boolean} [props.dot=false] - Whether to render a visual pulsing dot.
 * @returns {React.ReactElement} The rendered Badge.
 */
export default React.memo(function Badge({
  children,
  variant = "info", // "info", "danger", "warning", "success"
  className = "",
  dot = false,
}) {
  return (
    <span className={`badge badge--${variant} ${className}`}>
      {dot && <span className={`badge-dot badge-dot--${variant}`} />}
      {children}
    </span>
  );
});
