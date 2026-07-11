import React from "react";

export default function SystemHealth({ isConnected, loading }) {
  const services = [
    { name: "Backend Core", key: "backend", status: isConnected ? "online" : "offline", label: isConnected ? "ONLINE" : "OFFLINE" },
    { name: "Database Cluster", key: "database", status: isConnected ? "online" : "offline", label: isConnected ? "SYNCED" : "OFFLINE" },
    { name: "AI Gemini Engine", key: "ai", status: isConnected ? "online" : "offline", label: isConnected ? "ACTIVE" : "STANDBY" },
    { name: "Scheduler Loop", key: "scheduler", status: isConnected ? "online" : "offline", label: isConnected ? "RUNNING" : "STOPPED" },
    { name: "API Gateways", key: "api", status: isConnected ? "online" : "offline", label: isConnected ? "OPERATIONAL" : "DEGRADED" }
  ];

  return (
    <article 
      className="card system-health-card" 
      id="system-health-panel" 
      tabIndex="0" 
      aria-label="System Infrastructure Health"
    >
      <div className="card__header">
        <h2 className="card__title">
          <span className="card__title-icon">⚙️</span>
          Infrastructure Nodes
        </h2>
      </div>

      <div className="card__body">
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[...Array(5)].map((_, i) => (
              <div className="skeleton-box" key={i} style={{ width: "100%", height: "24px" }}></div>
            ))}
          </div>
        ) : (
          <div className="system-health-list">
            {services.map((svc) => (
              <div 
                key={svc.key} 
                className="system-health-item"
                tabIndex="0"
                aria-label={`${svc.name} is ${svc.label}`}
              >
                <div className="system-health-item__info">
                  <span className="system-health-item__dot" data-status={svc.status}>●</span>
                  <span className="system-health-item__name">{svc.name}</span>
                </div>
                <span className={`system-health-item__status status-${svc.status}`}>
                  {svc.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
