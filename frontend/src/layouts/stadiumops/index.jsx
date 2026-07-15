import React from "react";
// @mui material components
import { Card, Grid } from "@mui/material";

// Vision UI Dashboard React components
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";

// Vision UI Dashboard React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Existing hooks
import useDashboardData from "../../hooks/useDashboardData";

// Import existing dashboard panels directly
import KPIRow from "../../components/dashboard/cards/KPIRow";
import GateTrafficPanel from "../../components/dashboard/charts/GateTrafficPanel";
import InventoryPanel from "../../components/dashboard/charts/InventoryPanel";
import StaffPanel from "../../components/dashboard/charts/StaffPanel";
import RiskConfidencePanel from "../../components/dashboard/cards/RiskConfidencePanel";
import StadiumOverview from "../../components/dashboard/map/StadiumOverview";
import ActivityTimeline from "../../components/dashboard/alerts/ActivityTimeline";
import AIThinkingPanel from "../../components/dashboard/alerts/AIThinkingPanel";
import PredictionPanel from "../../components/dashboard/alerts/PredictionPanel";
import CameraWall from "../../components/dashboard/surveillance/CameraWall";
import QuickActions from "../../components/dashboard/cards/QuickActions";

export default function StadiumOpsDashboard() {
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
    <DashboardLayout>
      <DashboardNavbar />
      
      <VuiBox py={3}>
        {/* Connection banner */}
        {!isConnected && dashboard && (
          <VuiBox mb={3} p={2} sx={{ 
            backgroundColor: "rgba(239, 68, 68, 0.1)", 
            borderLeft: "4px solid #ef4444",
            borderRadius: "8px"
          }}>
            <VuiTypography variant="button" color="white" fontWeight="medium">
              ⚠️ Connection to StadiumOps API lost. Showing cached data. Reconnecting in the background…
            </VuiTypography>
          </VuiBox>
        )}

        {/* Offline full screen when no data is loaded yet */}
        {!loading && !dashboard && error && (
          <VuiBox display="flex" justifyContent="center" alignItems="center" minHeight="50vh" py={3}>
            <Card sx={{ maxWidth: 500, p: 3, textAlign: "center" }}>
              <VuiTypography variant="h4" color="white" mb={2}>📡 Connection Offline</VuiTypography>
              <VuiTypography variant="body2" color="text" mb={3}>
                Unable to establish connection to the StadiumOps AI Command Center. Please verify that the backend API service is running.
              </VuiTypography>
              <VuiBox mb={3} p={1} sx={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "4px" }}>
                <code style={{ color: "#ef4444" }}>{error}</code>
              </VuiBox>
              <button 
                className="btn btn--primary" 
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none", cursor: "pointer", background: "#00f2fe", color: "#fff", fontWeight: "bold" }}
                onClick={() => window.location.reload()}
              >
                Retry Connection
              </button>
            </Card>
          </VuiBox>
        )}

        {(loading || dashboard) && (
          <Grid container spacing={3}>
            {/* Top KPI row */}
            <Grid item xs={12}>
              <KPIRow
                data={dashboard}
                liveAlerts={liveAlerts}
                isConnected={isConnected}
                loading={loading}
              />
            </Grid>

            {/* Quick Actions Row */}
            <Grid item xs={12}>
              <QuickActions />
            </Grid>

            {/* Hero Grid: Stadium Overview (Left) + AI Thinking + Risk (Right) */}
            <Grid item xs={12} lg={8}>
              <Card sx={{ height: "100%" }}>
                <StadiumOverview
                  gates={dashboard?.gates}
                  liveAlerts={liveAlerts}
                  isConnected={isConnected}
                  loading={loading}
                  error={dashboardError}
                  onActionComplete={refresh}
                />
              </Card>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card sx={{ height: "100%" }}>
                    <AIThinkingPanel
                      liveAlerts={liveAlerts}
                      lastUpdated={lastUpdated}
                      loading={loading}
                      error={alertsError}
                      onRetry={refresh}
                    />
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card sx={{ height: "100%" }}>
                    <RiskConfidencePanel
                      dashboard={dashboard}
                      isConnected={isConnected}
                      loading={loading}
                      error={dashboardError || alertsError}
                      onRetry={refresh}
                    />
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* Predictions & Camera Wall */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%" }}>
                <PredictionPanel dashboard={dashboard} />
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%" }}>
                <CameraWall />
              </Card>
            </Grid>

            {/* Bottom Grid: Logistics & Timeline */}
            <Grid item xs={12} lg={8}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <GateTrafficPanel
                      gates={dashboard?.gates}
                      loading={loading}
                      error={dashboardError}
                      onRetry={refresh}
                    />
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <InventoryPanel
                      inventory={dashboard?.inventory}
                      loading={loading}
                      error={dashboardError}
                      onRetry={refresh}
                    />
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <StaffPanel
                      staff={dashboard?.staff}
                      loading={loading}
                      error={dashboardError}
                      onRetry={refresh}
                    />
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Card sx={{ height: "100%" }}>
                <ActivityTimeline
                  history={alertHistory}
                  loading={loading}
                  error={historyError}
                />
              </Card>
            </Grid>
          </Grid>
        )}
      </VuiBox>
      <Footer />
    </DashboardLayout>
  );
}
