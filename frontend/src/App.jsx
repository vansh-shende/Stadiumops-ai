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
import Header from "./components/Header";
import BackgroundGrid from "./components/BackgroundGrid";
import NotificationToast from "./components/NotificationToast";
import useDashboardData from "./hooks/useDashboardData";
import { SimulationProvider } from "./context/SimulationContext";

// Lazy load heavy dashboard components for code splitting & performance optimization
const KPIRow = lazy(() => import("./components/KPIRow"));
const GateTrafficPanel = lazy(() => import("./components/GateTrafficPanel"));
const InventoryPanel = lazy(() => import("./components/InventoryPanel"));
const StaffPanel = lazy(() => import("./components/StaffPanel"));
const RiskConfidencePanel = lazy(() => import("./components/RiskConfidencePanel"));
const StadiumOverview = lazy(() => import("./components/StadiumOverview"));
const ActivityTimeline = lazy(() => import("./components/ActivityTimeline"));
const AIThinkingPanel = lazy(() => import("./components/AIThinkingPanel"));
const PredictionPanel = lazy(() => import("./components/PredictionPanel"));
const CameraWall = lazy(() => import("./components/CameraWall"));
const QuickActions = lazy(() => import("./components/QuickActions"));

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
          <Suspense fallback={
            <div className="ai-loading-state" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "40vh", gap: "16px", padding: "40px" }}>
              <div className="ai-loading-pulse" />
              <span style={{ fontSize: "var(--font-sm)", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>INITIALIZING INTERFACE DIRECTIVES…</span>
            </div>
          }>
            {/* HERO BLOCK: Stadium Overview + AI Commander + Risk */}
            <div className="hero-grid">
              {/* Priority 1: Large Stadium Overview Map + Stats Overlay */}
              <div className="hero-left-section">
                <StadiumOverview
                  gates={dashboard?.gates}
                  liveAlerts={liveAlerts}
                  isConnected={isConnected}
                  loading={loading}
                  error={dashboardError}
                  onActionComplete={refresh}
                />
              </div>

              {/* Priority 2 & 3: AI Commander + Risk Meter */}
              <div className="hero-sidebar">
                {/* Feature 1: AI Thinking Panel (replaces AlertFeed) */}
                <AIThinkingPanel
                  liveAlerts={liveAlerts}
                  lastUpdated={lastUpdated}
                  loading={loading}
                  error={alertsError}
                  onRetry={refresh}
                />

                {/* Priority 3: Operational Risk Meter */}
                <RiskConfidencePanel
                  dashboard={dashboard}
                  liveAlerts={liveAlerts}
                  isConnected={isConnected}
                  loading={loading}
                  error={dashboardError || alertsError}
                  onRetry={refresh}
                />
              </div>
            </div>

            {/* Feature 4: Quick Actions */}
            <QuickActions />

            {/* Priority 4: KPI Row */}
            <KPIRow
              data={dashboard}
              liveAlerts={liveAlerts}
              isConnected={isConnected}
              loading={loading}
            />

            {/* Feature 2: Prediction Panel + Feature 3: Camera Wall */}
            <div className="intel-grid">
              <PredictionPanel
                liveAlerts={liveAlerts}
                dashboard={dashboard}
              />
              <CameraWall />
            </div>

            {/* MAIN LOWER GRID: Gate Status, Inventory, Staff Logistics, and Event Activity Timeline */}
            <div className="main-grid">
              {/* Left Column: Data panels */}
              <div className="left-column">
                {/* Priority 5: Gate Status Traffic Grid */}
                <GateTrafficPanel
                  gates={dashboard?.gates}
                  loading={loading}
                  error={dashboardError}
                  onRetry={refresh}
                />

                {/* Priority 6: Concession Inventory Summary */}
                <InventoryPanel
                  inventory={dashboard?.inventory}
                  loading={loading}
                  error={dashboardError}
                  onRetry={refresh}
                />

                {/* Priority 8: Staff Logistics Summary */}
                <StaffPanel
                  staff={dashboard?.staff}
                  loading={loading}
                  error={dashboardError}
                  onRetry={refresh}
                />
              </div>

              {/* Right Column: Historical Event Log */}
              <div className="right-column-timeline">
                {/* Priority 7: Activity Timeline */}
                <ActivityTimeline
                  history={alertHistory}
                  loading={loading}
                  error={historyError}
                />
              </div>
            </div>
          </Suspense>
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
