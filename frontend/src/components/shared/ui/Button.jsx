import React from "react";

export default React.memo(function Button({
  children,
  onClick,
  variant = "primary", // "primary", "secondary", "danger", "warning", "info"
  size = "md", // "sm", "md", "lg"
  disabled = false,
  className = "",
  type = "button",
  ariaLabel,
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
    >
      {children}
    </button>
  );
});
