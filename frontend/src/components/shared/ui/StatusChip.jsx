import React from "react";

/**
 * StatusChip — Small pill-shaped indicator for status display.
 *
 * Renders a `<span>` with BEM-style class names derived from the `variant`
 * prop, suitable for inline status labels within tables, modals, or cards.
 *
 * @param {Object}          props
 * @param {React.ReactNode} props.children        - Label content rendered inside the pill.
 * @param {"success"|"danger"|"warning"|"info"} [props.variant="info"] - Visual variant.
 * @param {string}          [props.className=""]  - Additional CSS class names.
 * @param {React.CSSProperties} [props.style]     - Inline style overrides.
 * @returns {React.ReactElement} The rendered status pill element.
 */
export default React.memo(function StatusChip({
  children,
  variant = "info",
  className = "",
  style,
}) {
  return (
    <span className={`status-pill status-pill--${variant} ${className}`} style={style}>
      {children}
    </span>
  );
});
