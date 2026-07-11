import React, { useState } from "react";
import { classifyAlert, parseAlert } from "../utils/helpers";

export default function ActivityTimeline({ history = [], loading, error }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (loading) {
    return (
      <article className="card activity-timeline-card skeleton" id="activity-timeline-panel">
        <div className="skeleton-box" style={{ width: "160px", height: "14px", marginBottom: "16px" }}></div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ display: "flex", gap: "12px" }}>
              <div className="skeleton-box" style={{ width: "12px", height: "12px", borderRadius: "50%" }}></div>
              <div style={{ flex: 1 }}>
                <div className="skeleton-box" style={{ width: "30%", height: "10px", marginBottom: "6px" }}></div>
                <div className="skeleton-box" style={{ width: "70%", height: "14px" }}></div>
              </div>
            </div>
          ))}
        </div>
      </article>
    );
  }

  if (error) {
    return (
      <article className="card activity-timeline-card" id="activity-timeline-panel" tabIndex="0" aria-label="Activity Log Error">
        <div className="card__header">
          <h2 className="card__title">
            <span className="card__title-icon">📜</span>
            Log
          </h2>
        </div>
        <div className="card__body">
          <div className="panel-error-card">
            <span className="panel-error-card__icon" aria-hidden="true">⚠️</span>
            <div className="panel-error-card__content">
              <h3 className="panel-error-card__title">Offline</h3>
              <p className="panel-error-card__message">{error}</p>
            </div>
          </div>
        </div>
      </article>
    );
  }

  const items = history.slice(0, 15);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <article 
      className="card activity-timeline-card" 
      id="activity-timeline-panel" 
      tabIndex="0" 
      aria-label="Activity Log"
    >
      <div className="card__header">
        <h2 className="card__title">
          <span className="card__title-icon">📜</span>
          Activity Log
        </h2>
      </div>

      <div className="card__body">
        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon" aria-hidden="true">📜</div>
            <div className="empty-state__message">No logged events</div>
          </div>
        ) : (
          <div className="timeline-container">
            {items.map((log, index) => {
              const timeStr = log.generatedAt
                ? new Date(log.generatedAt).toLocaleTimeString("en-US", { hour12: false })
                : "";
              
              const primaryAlert = log.alerts && log.alerts[0] ? log.alerts[0] : "";
              const level = primaryAlert ? classifyAlert(primaryAlert) : "info";
              const dotClass = level === "critical" ? "danger" : level;
              const parsed = primaryAlert ? parseAlert(primaryAlert) : { message: "Report generated" };
              const isExpanded = expandedIndex === index;

              return (
                <div 
                  key={index} 
                  className={`timeline-item timeline-item--expandable ${isExpanded ? "timeline-item--expanded" : ""}`}
                  tabIndex="0"
                  onClick={() => toggleExpand(index)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleExpand(index);
                    }
                  }}
                  aria-expanded={isExpanded}
                  aria-label={`Log entry at ${timeStr}: ${parsed.message}.`}
                >
                  <div className="timeline-track">
                    <div className={`timeline-dot timeline-dot--${dotClass}`} aria-hidden="true" />
                    {index < items.length - 1 && <div className="timeline-line" aria-hidden="true" />}
                  </div>

                  <div className="timeline-content">
                    <div className="timeline-meta">
                      <span className="timeline-time">{timeStr}</span>
                      {log.anomalyCount > 0 ? (
                        <span className="timeline-badge timeline-badge--warning">
                          {log.anomalyCount} ⚠️
                        </span>
                      ) : (
                        <span className="timeline-badge timeline-badge--ok">✓ OK</span>
                      )}
                    </div>
                    <p className="timeline-desc">{parsed.message}</p>
                    
                    {isExpanded && log.alerts && log.alerts.length > 0 && (
                      <div className="timeline-expanded-details animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        <span className="timeline-expanded-title">SENSORS:</span>
                        <ul className="timeline-expanded-list">
                          {log.alerts.map((alertText, aIdx) => {
                            const aLevel = classifyAlert(alertText);
                            const aParsed = parseAlert(alertText);
                            return (
                              <li key={aIdx} className={`timeline-expanded-item timeline-expanded-item--${aLevel}`}>
                                <span className={`badge badge--${aLevel}`}>{aParsed.tag}</span>
                                <span className="timeline-expanded-text">{aParsed.message}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Timeline Footer HUD */}
      <div className="timeline-footer">
        <span className="timeline-footer-status">LOGGING STATUS: ACTIVE</span>
        <span className="timeline-footer-stats">BUFFER CAPACITY: 100% ({items.length}/15)</span>
      </div>
    </article>
  );
}
