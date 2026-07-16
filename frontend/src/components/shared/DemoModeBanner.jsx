/**
 * DemoModeBanner — Shown when the app is using fallback demo data
 * because the backend API is unreachable (e.g. Render cold start).
 */
import React from "react";
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";

export default function DemoModeBanner() {
  return (
    <VuiBox
      mb={3}
      p={2}
      sx={{
        background: "linear-gradient(135deg, rgba(0, 242, 254, 0.12) 0%, rgba(79, 172, 254, 0.12) 100%)",
        borderLeft: "4px solid #00f2fe",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <span style={{ fontSize: "20px" }}>🎮</span>
      <VuiBox>
        <VuiTypography variant="button" color="white" fontWeight="bold">
          Demo Mode — Live Preview
        </VuiTypography>
        <VuiTypography variant="caption" color="text" sx={{ display: "block", mt: 0.3 }}>
          Backend API is warming up. Showing demo data — live data will load automatically once the server is ready.
        </VuiTypography>
      </VuiBox>
    </VuiBox>
  );
}
