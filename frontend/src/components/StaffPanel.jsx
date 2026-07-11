import { useState } from "react";
import { timeAgo } from "../utils/helpers";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function StaffPanel({ staff = [], loading, error, onRetry }) {
  const [showDetails, setShowDetails] = useState(false);
  const hasData = staff && staff.length > 0;

  // Simple helper to get initials
  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const availableStaff = staff.filter((s) => s.status === "Available").length;
  const busyStaff = staff.filter((s) => s.status === "Busy").length;
  const totalStaff = staff.length;
  
  // Emergency/Tactical team counts (e.g. 2 members per team)
  const emergencyTeams = Math.max(1, Math.floor(busyStaff / 2));
  
  // Deployment Efficiency index
  const deploymentEfficiency = totalStaff > 0
    ? Math.round(((totalStaff - busyStaff) / totalStaff) * 100)
    : 100;

  // Recharts pie data
  const donutData = [
    { name: "Available", value: availableStaff },
    { name: "Busy", value: busyStaff }
  ];
  const COLORS = ["#10b981", "#ef4444"];

  return (
    <article 
      className="card" 
      id="staff-panel" 
      tabIndex="0" 
      aria-label="Staff Logistics Summary"
    >
      <div className="card__header">
        <h2 className="card__title">
          <span className="card__title-icon">🧑‍💼</span>
          Staff Logistics Summary
        </h2>
        {!loading && !error && hasData && (
          <span className="card__count" id="staff-count">
            {totalStaff} active
          </span>
        )}
      </div>
      
      <div className="card__body">
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="skeleton-box" style={{ width: "100%", height: "60px" }}></div>
            <div className="skeleton-box" style={{ width: "120px", height: "24px" }}></div>
          </div>
        ) : error ? (
          <div className="panel-error-card" role="alert">
            <span className="panel-error-card__icon" aria-hidden="true">⚠️</span>
            <div className="panel-error-card__content">
              <h3 className="panel-error-card__title">Telemetry Offline</h3>
              <p className="panel-error-card__message">{error}</p>
            </div>
            {onRetry && (
              <button 
                className="btn btn--secondary btn--xs" 
                onClick={onRetry}
                aria-label="Retry loading staff"
              >
                Retry
              </button>
            )}
          </div>
        ) : !hasData ? (
          <div className="empty-state">
            <div className="empty-state__icon" aria-hidden="true">🧑‍💼</div>
            <div className="empty-state__message">No staff logistics records available</div>
          </div>
        ) : (
          <div className="staff-summary-container">
            {!showDetails ? (
              /* Summary Dashboard with Recharts Donut Chart */
              <div className="summary-split-layout">
                {/* Left side metrics */}
                <div className="summary-metrics-block">
                  <div className="summary-main-score">
                    <span className="summary-score-title">DEPLOYMENT EFFICIENCY</span>
                    <span className={`summary-score-value text-${deploymentEfficiency >= 80 ? "success" : deploymentEfficiency >= 50 ? "warning" : "danger"}`}>
                      {deploymentEfficiency}%
                    </span>
                  </div>

                  <div className="summary-stats-grid">
                    <div className="summary-stat-box">
                      <span className="summary-stat-label">AVAILABLE STAFF</span>
                      <span className="summary-stat-val text-success">
                        {availableStaff}
                      </span>
                    </div>
                    <div className="summary-stat-box">
                      <span className="summary-stat-label">BUSY STAFF</span>
                      <span className="summary-stat-val text-danger">
                        {busyStaff}
                      </span>
                    </div>
                    <div className="summary-stat-box">
                      <span className="summary-stat-label">TACTICAL TEAMS</span>
                      <span className="summary-stat-val text-info">
                        {emergencyTeams} ACT.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side donut chart */}
                <div className="summary-chart-side" style={{ width: "90px", height: "90px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={24}
                        outerRadius={34}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              /* Detailed Staff Cards Grid */
              <div className="ops-card-grid animate-fade-in" id="staff-body">
                {staff.map((member) => {
                  const statusColor =
                    member.status === "Available"
                      ? "success"
                      : member.status === "Busy"
                      ? "danger"
                      : "warning";
                  const initials = getInitials(member.staff_name);

                  return (
                    <div 
                      key={member.id} 
                      className={`ops-card ops-card--border-${statusColor}`}
                      tabIndex="0"
                      aria-label={`${member.staff_name}: status ${member.status}, assigned to ${member.zone}`}
                    >
                      <div className="ops-card__staff-header">
                        <div className="ops-avatar" aria-hidden="true">
                          {initials}
                        </div>
                        <div className="ops-card__staff-info">
                          <span className="ops-card__staff-name">{member.staff_name}</span>
                          <span className="ops-card__staff-zone">{member.zone}</span>
                        </div>
                      </div>
                      
                      <div className="ops-card__staff-footer">
                        <span className={`status-pill status-pill--${statusColor}`}>
                          <span>●</span>
                          {member.status}
                        </span>
                        <span className="ops-card__meta">{timeAgo(member.updated_at)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Toggle Button */}
            <div className="summary-toggle-footer">
              <button 
                className="btn btn--secondary btn--sm" 
                onClick={() => setShowDetails(!showDetails)}
                aria-label={showDetails ? "Hide staff members detail" : "View raw staff list"}
              >
                {showDetails ? "Hide Details" : "View Details"}
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
