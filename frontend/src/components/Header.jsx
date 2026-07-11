/**
 * Header — Command bar with logo, status badges, sync times, and ticking clock.
 */

import { useState, useEffect } from "react";

export default function Header({ isConnected, liveAlerts, loading, lastUpdated }) {
  const [clock, setClock] = useState("—");
  const [relativeSync, setRelativeSync] = useState("—");

  // Clock tick
  useEffect(() => {
    function tick() {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const year = now.getFullYear();
      const month = pad(now.getMonth() + 1);
      const day = pad(now.getDate());
      const hours = pad(now.getHours());
      const minutes = pad(now.getMinutes());
      const seconds = pad(now.getSeconds());
      setClock(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Relative last sync tick
  useEffect(() => {
    if (!lastUpdated) {
      setRelativeSync("—");
      return;
    }

    function updateRelative() {
      const diffMs = Date.now() - lastUpdated.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 5) {
        setRelativeSync("Just now");
      } else if (diffSec < 60) {
        setRelativeSync(`${diffSec} sec ago`);
      } else {
        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) {
          setRelativeSync(`${diffMin} min ago`);
        } else {
          const diffHours = Math.floor(diffMin / 60);
          setRelativeSync(`${diffHours}h ago`);
        }
      }
    }

    updateRelative();
    const id = setInterval(updateRelative, 1000);
    return () => clearInterval(id);
  }, [lastUpdated]);

  // Backend status
  const backendStatusText = isConnected ? "ONLINE" : "OFFLINE";
  const backendStatusClass = isConnected ? "status-dot status-dot--success" : "status-dot status-dot--danger";

  // AI status
  let aiStatusText = "STANDBY";
  let aiStatusClass = "status-dot status-dot--info";
  if (!isConnected) {
    aiStatusText = "OFFLINE";
    aiStatusClass = "status-dot status-dot--danger";
  } else if (liveAlerts && liveAlerts.status === "processing") {
    aiStatusText = "ANALYZING";
    aiStatusClass = "status-dot status-dot--warning status-dot--pulse";
  } else if (loading) {
    aiStatusText = "INITIALIZING";
    aiStatusClass = "status-dot status-dot--warning";
  } else if (liveAlerts && liveAlerts.alerts && liveAlerts.alerts.length > 0) {
    aiStatusText = "ACTIVE";
    aiStatusClass = "status-dot status-dot--success";
  }

  // System status
  let systemStatusText = "HEALTHY";
  let systemStatusClass = "status-dot status-dot--success";
  if (!isConnected) {
    systemStatusText = "DISCONNECTED";
    systemStatusClass = "status-dot status-dot--danger";
  } else if (liveAlerts && liveAlerts.alerts && liveAlerts.alerts.some(a => a.startsWith("[CRITICAL]"))) {
    systemStatusText = "CRITICAL";
    systemStatusClass = "status-dot status-dot--danger";
  } else if (liveAlerts && liveAlerts.alerts && liveAlerts.alerts.some(a => a.startsWith("[WARNING]"))) {
    systemStatusText = "DEGRADED";
    systemStatusClass = "status-dot status-dot--warning";
  }

  return (
    <header className="header" id="app-header">
      <div className="header__brand">
        <div className="header__logo">
          <svg viewBox="0 0 100 100" className="header__logo-svg" alt="StadiumOps Logo">
            <rect x="15" y="15" width="70" height="70" rx="4" fill="none" stroke="var(--color-info)" strokeWidth="10" />
            <path d="M 35,50 L 47,62 L 68,38" fill="none" stroke="var(--color-info)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="header__titles">
          <h1 className="header__title">
            StadiumOps <span>AI</span>
            <span className="live-indicator">
              <span className="live-indicator__dot"></span>
              LIVE
            </span>
          </h1>
          <span className="header__subtitle">FIFA Ops Command Center</span>
        </div>
      </div>

      <div className="header__statuses">
        <div className="header__status-item" id="system-status">
          <span className="header__status-label">SYSTEM</span>
          <span className="header__status-value">
            <span className={systemStatusClass}></span>
            {systemStatusText}
          </span>
        </div>
        <div className="header__status-item" id="ai-status">
          <span className="header__status-label">AI ENGINE</span>
          <span className="header__status-value">
            <span className={aiStatusClass}></span>
            {aiStatusText}
          </span>
        </div>
        <div className="header__status-item" id="backend-status">
          <span className="header__status-label">BACKEND</span>
          <span className="header__status-value">
            <span className={backendStatusClass}></span>
            {backendStatusText}
          </span>
        </div>
      </div>

      <div className="header__meta">
        <div className="header__meta-item" id="last-sync">
          <span className="header__meta-label">LAST SYNC</span>
          <span className="header__meta-value">{relativeSync}</span>
        </div>
        <div className="header__meta-item" id="current-time">
          <span className="header__meta-label">LOCAL TIME</span>
          <time className="header__clock">{clock}</time>
        </div>
      </div>
    </header>
  );
}
