import React from "react";

export default React.memo(function TimelineItem({
  timestamp,
  category,
  message,
  location,
  recommendedAction,
  severity = "info", // "critical", "warning", "info"
}) {
  return (
    <div className={`timeline-item timeline-item--${severity}`}>
      <div className="timeline-badge">
        <span className="timeline-badge-dot" />
      </div>
      <div className="timeline-content">
        <div className="timeline-header">
          <span className="timeline-time">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
          <span className="timeline-category">{category}</span>
        </div>
        <div className="timeline-message">{message}</div>
        <div className="timeline-meta">
          <span>Location: <strong>{location}</strong></span>
          {recommendedAction && (
            <span>Action: <strong>{recommendedAction}</strong></span>
          )}
        </div>
      </div>
    </div>
  );
});
