import { useState } from "react";
import { qtyTier, timeAgo } from "../utils/helpers";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function InventoryPanel({ inventory = [], loading, error, onRetry }) {
  const [showDetails, setShowDetails] = useState(false);
  const hasData = inventory && inventory.length > 0;

  // Inventory thresholds
  const lowStockThreshold = 30;
  const healthyStockThreshold = 80;

  const criticalItems = inventory.filter(item => item.quantity < lowStockThreshold);
  const healthyItemsCount = inventory.filter(item => item.quantity >= healthyStockThreshold).length;
  const totalItems = inventory.length;
  
  const inventoryHealth = totalItems > 0
    ? Math.round(((totalItems - criticalItems.length) / totalItems) * 100)
    : 100;

  // Recharts Donut data
  const donutData = [
    { name: "Healthy", value: totalItems - criticalItems.length },
    { name: "Critical", value: criticalItems.length }
  ];
  const COLORS = ["#10b981", "#ef4444"];

  return (
    <article 
      className="card" 
      id="inventory-panel" 
      tabIndex="0" 
      aria-label="Concession Inventory Summary"
    >
      <div className="card__header">
        <h2 className="card__title">
          <span className="card__title-icon">📦</span>
          Concession Inventory Summary
        </h2>
        {!loading && !error && hasData && (
          <span className="card__count" id="inventory-count">
            {totalItems} stands
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
                aria-label="Retry loading inventory"
              >
                Retry
              </button>
            )}
          </div>
        ) : !hasData ? (
          <div className="empty-state">
            <div className="empty-state__icon" aria-hidden="true">📦</div>
            <div className="empty-state__message">No concession inventory records available</div>
          </div>
        ) : (
          <div className="inventory-summary-container">
            {!showDetails ? (
              /* Summary Dashboard with Recharts Donut Chart */
              <div className="summary-split-layout">
                {/* Left side metrics */}
                <div className="summary-metrics-block">
                  <div className="summary-main-score">
                    <span className="summary-score-title">INVENTORY HEALTH</span>
                    <span className={`summary-score-value text-${inventoryHealth >= 80 ? "success" : inventoryHealth >= 50 ? "warning" : "danger"}`}>
                      {inventoryHealth}%
                    </span>
                  </div>

                  <div className="summary-stats-grid">
                    <div className="summary-stat-box">
                      <span className="summary-stat-label">CRITICAL ITEMS</span>
                      <span className={`summary-stat-val ${criticalItems.length > 0 ? "text-danger" : "text-success"}`}>
                        {criticalItems.length}
                      </span>
                    </div>
                    <div className="summary-stat-box">
                      <span className="summary-stat-label">HEALTHY ITEMS</span>
                      <span className="summary-stat-val text-success">
                        {healthyItemsCount}
                      </span>
                    </div>
                    <div className="summary-stat-box">
                      <span className="summary-stat-label">RESTOCK REQ.</span>
                      <span className={`summary-stat-val ${criticalItems.length > 0 ? "text-warning" : "text-success"}`}>
                        {criticalItems.length > 0 ? "YES" : "NO"}
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
              /* Detailed Concession Cards Grid */
              <div className="ops-card-grid animate-fade-in" id="inventory-body">
                {inventory.map((item) => {
                  const tier = qtyTier(item.quantity);
                  const statusCls = tier === "low" ? "danger" : tier === "medium" ? "warning" : "success";

                  return (
                    <div 
                      key={item.id} 
                      className={`ops-card ops-card--border-${statusCls}`}
                      tabIndex="0"
                      aria-label={`${item.stand_name}: item ${item.item_name}, quantity remaining ${item.quantity}`}
                    >
                      <div className="ops-card__header">
                        <span className="ops-card__stand">{item.stand_name}</span>
                        <span className="ops-card__meta">{timeAgo(item.updated_at)}</span>
                      </div>
                      
                      <div className="ops-card__inventory-body">
                        <span className="ops-card__item-name">{item.item_name}</span>
                        <div className="ops-card__qty-badge">
                          <span className={`qty-indicator qty-indicator--${tier}`}>
                            {item.quantity} units
                          </span>
                        </div>
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
                aria-label={showDetails ? "Hide Details (Hide concession details)" : "View Details (View raw concession details)"}
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
