import React from "react";
import { Card, Grid } from "@mui/material";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import useDashboardData from "../../hooks/useDashboardData";
import DemoModeBanner from "../../components/shared/DemoModeBanner";

import RiskConfidencePanel from "../../components/dashboard/cards/RiskConfidencePanel";
import ActivityTimeline from "../../components/dashboard/alerts/ActivityTimeline";
import AIThinkingPanel from "../../components/dashboard/alerts/AIThinkingPanel";
import PredictionPanel from "../../components/dashboard/alerts/PredictionPanel";
import CameraWall from "../../components/dashboard/surveillance/CameraWall";

export default function AIIntelligenceDashboard() {
  const {
    dashboard,
    liveAlerts,
    alertHistory,
    loading,
    error,
    isConnected,
    isDemoMode,
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
        {isDemoMode && <DemoModeBanner />}

        {!isConnected && !isDemoMode && dashboard && (
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
            {/* AI Insights & Risk Row */}
            <Grid item xs={12} lg={8}>
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
            
            <Grid item xs={12} lg={4}>
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

            {/* Camera Wall & Predictions */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%" }}>
                <CameraWall />
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%" }}>
                <PredictionPanel dashboard={dashboard} />
              </Card>
            </Grid>

            {/* Timeline */}
            <Grid item xs={12}>
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
