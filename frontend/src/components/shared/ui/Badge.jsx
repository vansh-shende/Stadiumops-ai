import React from "react";

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
