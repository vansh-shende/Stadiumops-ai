import React from "react";

export default React.memo(function Card({
  title,
  icon,
  headerRight,
  className = "",
  children,
  id,
}) {
  return (
    <article className={`card ${className}`} id={id}>
      {(title || icon || headerRight) && (
        <div className="card__header">
          <h2 className="card__title">
            {icon && <span className="card__title-icon">{icon}</span>}
            {title}
          </h2>
          {headerRight}
        </div>
      )}
      {children}
    </article>
  );
});
