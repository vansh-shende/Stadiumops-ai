import React from "react";

/**
 * Card — Container component for layout wrapping and section organization.
 *
 * Renders an `<article>` tag with dynamic header layout. If the header props
 * are omitted, the header node is excluded entirely for layout compression.
 *
 * @param {Object} props
 * @param {string} props.title - Title text displayed in the header.
 * @param {string} [props.icon] - Emoji/character representing card content.
 * @param {React.ReactNode} [props.headerRight] - Custom controls aligned on the right.
 * @param {string} [props.className=""] - Additional custom classes.
 * @param {React.ReactNode} props.children - Inner block content of the card.
 * @param {string} [props.id] - Optional HTML element identifier.
 * @returns {React.ReactElement} The rendered Card layout element.
 */
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
