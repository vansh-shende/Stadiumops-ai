import React from "react";
import { Card, Grid } from "@mui/material";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import useDashboardData from "../../hooks/useDashboardData";
import DemoModeBanner from "../../components/shared/DemoModeBanner";

import KPIRow from "../../components/dashboard/cards/KPIRow";
import StadiumOverview from "../../components/dashboard/map/StadiumOverview";
import QuickActions from "../../components/dashboard/cards/QuickActions";

export default function MapOperationsDashboard() {
  const {
    dashboard,
    liveAlerts,
    loading,
    error,
    isConnected,
    isDemoMode,
    dashboardError,
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
            <Grid item xs={12}>
              <KPIRow
                data={dashboard}
                liveAlerts={liveAlerts}
                isConnected={isConnected}
                loading={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <QuickActions />
            </Grid>

            <Grid item xs={12}>
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
          </Grid>
        )}
      </VuiBox>
      <Footer />
    </DashboardLayout>
  );
}
