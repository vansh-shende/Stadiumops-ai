import React from "react";

export default React.memo(function StatusChip({
  children,
  variant = "info", // "success", "danger", "warning", "info"
  className = "",
}) {
  return (
    <span className={`status-pill status-pill--${variant} ${className}`}>
      {children}
    </span>
  );
});
