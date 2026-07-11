/**
 * =========================================================
 *  StadiumOps AI — App Component
 * =========================================================
 *
 *  Root component that assembles the dashboard layout.
 *  Consumes useDashboardData() hook and distributes
 *  live API data to all child components.
 *
 *  Enhanced with:
 *    - AI Thinking Panel (replaces static AlertFeed)
 *    - Prediction Panel
 *    - Live Camera Wall
 *    - Quick Actions
 *    - Simulation Mode
 */

import React, { Suspense, lazy } from "react";
import Header from "./components/layout/Header";
import BackgroundGrid from "./components/layout/BackgroundGrid";
import NotificationToast from "./components/layout/NotificationToast";
import useDashboardData from "./hooks/useDashboardData";
import { SimulationProvider } from "./context/SimulationContext";

// Lazy load heavy dashboard components for code splitting & performance optimization
const KPIRow = lazy(() => import("./components/dashboard/cards/KPIRow"));
const GateTrafficPanel = lazy(() => import("./components/dashboard/charts/GateTrafficPanel"));
const InventoryPanel = lazy(() => import("./components/dashboard/charts/InventoryPanel"));
const StaffPanel = lazy(() => import("./components/dashboard/charts/StaffPanel"));
const RiskConfidencePanel = lazy(() => import("./components/dashboard/cards/RiskConfidencePanel"));
const StadiumOverview = lazy(() => import("./components/dashboard/map/StadiumOverview"));
const ActivityTimeline = lazy(() => import("./components/dashboard/alerts/ActivityTimeline"));
const AIThinkingPanel = lazy(() => import("./components/dashboard/alerts/AIThinkingPanel"));
const PredictionPanel = lazy(() => import("./components/dashboard/alerts/PredictionPanel"));
const CameraWall = lazy(() => import("./components/dashboard/surveillance/CameraWall"));
const QuickActions = lazy(() => import("./components/dashboard/cards/QuickActions"));

function DashboardContent() {
  const {
    dashboard,
    liveAlerts,
    alertHistory,
    loading,
    error,
    isConnected,
    lastUpdated,
    dashboardError,
    alertsError,
    historyError,
    refresh,
  } = useDashboardData();

  return (
    <>
      {/* Ambient Background */}
      <BackgroundGrid />

      {/* Header / Top Command Bar */}
      <Header
        isConnected={isConnected}
        liveAlerts={liveAlerts}
        loading={loading}
        lastUpdated={lastUpdated}
      />

      {/* Live Alert Notifications */}
      <NotificationToast liveAlerts={liveAlerts} lastUpdated={lastUpdated} />

      {/* Dashboard Main View */}
      <main className="dashboard" id="dashboard">
        {/* Offline overlay banner when cached data exists but connection is lost */}
        {!isConnected && dashboard && (
          <div className="connection-banner" id="connection-banner">
            <span className="connection-banner__icon">⚠️</span>
            <span className="connection-banner__message">
              Connection to StadiumOps API lost. Showing cached data. Reconnecting in the background…
            </span>
          </div>
        )}

        {/* Offline full screen when no data is loaded yet */}
        {!loading && !dashboard && error && (
          <div className="offline-screen" id="offline-screen">
            <div className="offline-card">
              <div className="offline-card__icon">📡</div>
              <h2 className="offline-card__title">Connection Offline</h2>
              <p className="offline-card__message">
                Unable to establish connection to the StadiumOps AI Command Center. Please verify that the backend API service is running.
              </p>
              <code className="offline-card__error">{error}</code>
              <button className="btn btn--primary" onClick={() => window.location.reload()}>
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Dashboard content — rendered during loading or when data is available */}
        {(loading || dashboard) && (
          <>
            {/* HERO BLOCK: Stadium Overview + AI Commander + Risk */}
            <div className="hero-grid">
              {/* Priority 1: Large Stadium Overview Map + Stats Overlay */}
              <div className="hero-left-section">
                <Suspense fallback={
                  <article className="card stadium-overview-card skeleton" style={{ height: "480px" }}>
                    <div className="skeleton-box" style={{ width: "200px", height: "16px", marginBottom: "16px" }} />
                    <div style={{ display: "flex", gap: "24px", height: "400px" }}>
                      <div className="skeleton-box" style={{ flex: 1.5, height: "100%" }} />
                      <div className="skeleton-box" style={{ flex: 1, height: "100%" }} />
                    </div>
                  </article>
                }>
                  <StadiumOverview
                    gates={dashboard?.gates}
                    liveAlerts={liveAlerts}
                    isConnected={isConnected}
                    loading={loading}
                    error={dashboardError}
                    onActionComplete={refresh}
                  />
                </Suspense>
              </div>

              {/* Priority 2 & 3: AI Commander + Risk Meter */}
              <div className="hero-sidebar">
                {/* Feature 1: AI Thinking Panel (replaces AlertFeed) */}
                <Suspense fallback={
                  <article className="card ai-thinking-panel skeleton" style={{ height: "300px" }}>
                    <div className="skeleton-box" style={{ width: "150px", height: "16px", marginBottom: "16px" }} />
                    <div className="skeleton-box" style={{ width: "100%", height: "200px" }} />
                  </article>
                }>
                  <AIThinkingPanel
                    liveAlerts={liveAlerts}
                    lastUpdated={lastUpdated}
                    loading={loading}
                    error={alertsError}
                    onRetry={refresh}
                  />
                </Suspense>

                {/* Priority 3: Operational Risk Meter */}
                <Suspense fallback={
                  <article className="card risk-confidence-card skeleton" style={{ height: "180px" }}>
                    <div className="skeleton-box" style={{ width: "160px", height: "14px", marginBottom: "16px" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                      <div className="skeleton-box" style={{ width: "90px", height: "90px", borderRadius: "50%" }} />
                      <div className="skeleton-box" style={{ width: "70%", height: "12px" }} />
                    </div>
                  </article>
                }>
                  <RiskConfidencePanel
                    dashboard={dashboard}
                    liveAlerts={liveAlerts}
                    isConnected={isConnected}
                    loading={loading}
                    error={dashboardError || alertsError}
                    onRetry={refresh}
                  />
                </Suspense>
              </div>
            </div>

            {/* Feature 4: Quick Actions */}
            <Suspense fallback={
              <article className="card quick-actions-panel skeleton" style={{ height: "140px" }}>
                <div className="skeleton-box" style={{ width: "120px", height: "16px", marginBottom: "16px" }} />
                <div className="skeleton-box" style={{ width: "100%", height: "80px" }} />
              </article>
            }>
              <QuickActions />
            </Suspense>

            {/* Priority 4: KPI Row */}
            <Suspense fallback={
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", margin: "24px 0", height: "108px" }}>
                {[...Array(6)].map((_, i) => (
                  <div className="kpi-card skeleton" key={i} style={{ height: "108px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div className="skeleton-box" style={{ width: "20px", height: "20px", borderRadius: "50%" }} />
                      <div className="skeleton-box" style={{ width: "40px", height: "10px" }} />
                    </div>
                    <div className="skeleton-box" style={{ width: "60px", height: "24px", margin: "8px 0" }} />
                    <div className="skeleton-box" style={{ width: "100%", height: "8px" }} />
                  </div>
                ))}
              </div>
            }>
              <KPIRow
                data={dashboard}
                liveAlerts={liveAlerts}
                isConnected={isConnected}
                loading={loading}
              />
            </Suspense>

            {/* Feature 2: Prediction Panel + Feature 3: Camera Wall */}
            <div className="intel-grid">
              <Suspense fallback={
                <article className="card prediction-panel skeleton" style={{ height: "350px" }}>
                  <div className="skeleton-box" style={{ width: "150px", height: "16px", marginBottom: "16px" }} />
                  <div className="skeleton-box" style={{ width: "100%", height: "250px" }} />
                </article>
              }>
                <PredictionPanel
                  liveAlerts={liveAlerts}
                  dashboard={dashboard}
                />
              </Suspense>
              <Suspense fallback={
                <article className="card camera-wall skeleton" style={{ height: "350px" }}>
                  <div className="skeleton-box" style={{ width: "150px", height: "16px", marginBottom: "16px" }} />
                  <div className="skeleton-box" style={{ width: "100%", height: "250px" }} />
                </article>
              }>
                <CameraWall />
              </Suspense>
            </div>

            {/* MAIN LOWER GRID: Gate Status, Inventory, Staff Logistics, and Event Activity Timeline */}
            <div className="main-grid">
              {/* Left Column: Data panels */}
              <div className="left-column">
                {/* Priority 5: Gate Status Traffic Grid */}
                <Suspense fallback={
                  <article className="card gate-traffic-card skeleton" style={{ height: "340px" }}>
                    <div className="skeleton-box" style={{ width: "150px", height: "16px", marginBottom: "16px" }} />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "12px" }}>
                      {[...Array(6)].map((_, i) => (
                        <div className="ops-card skeleton" key={i} style={{ height: "120px" }}>
                          <div className="skeleton-box" style={{ width: "40%", height: "16px", marginBottom: "8px" }} />
                          <div className="skeleton-box" style={{ width: "100%", height: "24px" }} />
                        </div>
                      ))}
                    </div>
                  </article>
                }>
                  <GateTrafficPanel
                    gates={dashboard?.gates}
                    loading={loading}
                    error={dashboardError}
                    onRetry={refresh}
                  />
                </Suspense>

                {/* Priority 6: Concession Inventory Summary */}
                <Suspense fallback={
                  <article className="card inventory-card skeleton" style={{ height: "300px" }}>
                    <div className="skeleton-box" style={{ width: "150px", height: "16px", marginBottom: "16px" }} />
                    <div className="skeleton-box" style={{ width: "100%", height: "60px" }} />
                    <div className="skeleton-box" style={{ width: "120px", height: "24px" }} />
                  </article>
                }>
                  <InventoryPanel
                    inventory={dashboard?.inventory}
                    loading={loading}
                    error={dashboardError}
                    onRetry={refresh}
                  />
                </Suspense>

                {/* Priority 8: Staff Logistics Summary */}
                <Suspense fallback={
                  <article className="card staff-card skeleton" style={{ height: "300px" }}>
                    <div className="skeleton-box" style={{ width: "150px", height: "16px", marginBottom: "16px" }} />
                    <div className="skeleton-box" style={{ width: "100%", height: "60px" }} />
                    <div className="skeleton-box" style={{ width: "120px", height: "24px" }} />
                  </article>
                }>
                  <StaffPanel
                    staff={dashboard?.staff}
                    loading={loading}
                    error={dashboardError}
                    onRetry={refresh}
                  />
                </Suspense>
              </div>

              {/* Right Column: Historical Event Log */}
              <div className="right-column-timeline">
                {/* Priority 7: Activity Timeline */}
                <Suspense fallback={
                  <article className="card activity-timeline-card skeleton" style={{ height: "980px" }}>
                    <div className="skeleton-box" style={{ width: "160px", height: "14px", marginBottom: "16px" }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {[...Array(6)].map((_, i) => (
                        <div key={i} style={{ display: "flex", gap: "12px" }}>
                          <div className="skeleton-box" style={{ width: "12px", height: "12px", borderRadius: "50%" }} />
                          <div style={{ flex: 1 }}>
                            <div className="skeleton-box" style={{ width: "30%", height: "10px", marginBottom: "6px" }} />
                            <div className="skeleton-box" style={{ width: "70%", height: "14px" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                }>
                  <ActivityTimeline
                    history={alertHistory}
                    loading={loading}
                    error={historyError}
                  />
                </Suspense>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        StadiumOps AI &middot; FIFA Stadium Tactical Operations Dashboard &middot; 2026
      </footer>
    </>
  );
}

export default function App() {
  return (
    <SimulationProvider>
      <DashboardContent />
    </SimulationProvider>
  );
}
