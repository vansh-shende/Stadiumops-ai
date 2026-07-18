import React from "react";

/**
 * Button — Reusable, accessible button component with variant and size support.
 *
 * Computes BEM-style class names from the `variant` and `size` props.  When the
 * `className` already includes `quick-action-btn`, the base `.btn` prefix is
 * omitted so the caller can supply a fully custom class hierarchy.
 *
 * @param {Object}            props
 * @param {React.ReactNode}   props.children   - Button label / inner content.
 * @param {Function}          [props.onClick]  - Click handler callback.
 * @param {"primary"|"secondary"|"danger"|"warning"|"info"} [props.variant="primary"]
 *   Visual variant controlling colour scheme.
 * @param {"sm"|"md"|"lg"}    [props.size="md"] - Size modifier class.
 * @param {boolean}           [props.disabled=false] - Whether the button is disabled.
 * @param {string}            [props.className=""] - Additional CSS class names.
 * @param {string}            [props.type="button"] - HTML button type attribute.
 * @param {string}            [props.ariaLabel] - Accessible label for screen readers.
 * @param {React.CSSProperties} [props.style] - Inline style overrides.
 * @returns {React.ReactElement} The rendered button element.
 */
export default React.memo(function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  type = "button",
  ariaLabel,
  style,
}) {
  const baseClass = className.includes("quick-action-btn") ? "" : "btn";
  const variantClass = variant ? `${baseClass}--${variant}` : "";
  const sizeClass = size !== "md" ? `${baseClass}--${size}` : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`.trim()}
      aria-label={ariaLabel}
      style={style}
    >
      {children}
    </button>
  );
});
