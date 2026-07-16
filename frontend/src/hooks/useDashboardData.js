/**
 * =========================================================
 *  StadiumOps AI — useDashboardData Custom Hook
 * =========================================================
 *
 *  Manages all dashboard data fetching in a single hook:
 *    - Dashboard snapshot (gates, inventory, staff)
 *    - Live AI alerts
 *    - Alert history
 *
 *  Features:
 *    - Auto-refresh every 10 seconds
 *    - Independent loading/error states per data source
 *    - Demo mode detection (when backend is unavailable)
 *    - Cleanup on unmount (clears interval, aborts in-flight requests)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { getDashboard, getLiveAlerts, getAlertHistory } from "../services/api";

/** Refresh interval in milliseconds. */
const REFRESH_INTERVAL = 10_000;

/**
 * @typedef {Object} DashboardState
 * @property {Object|null}  dashboard      - { gates, inventory, staff, generatedAt }
 * @property {Object|null}  liveAlerts     - { generatedAt, anomalyCount, alerts }
 * @property {Array}        alertHistory   - Array of past alert reports
 * @property {boolean}      loading        - True during the initial load
 * @property {string|null}  error          - Error message if all three calls fail
 * @property {boolean}      isConnected    - True if at least one API call succeeds
 * @property {boolean}      isDemoMode     - True if showing fallback demo data
 * @property {Date|null}    lastUpdated    - Timestamp of last successful fetch
 */

export default function useDashboardData() {
  const [dashboard, setDashboard] = useState(null);
  const [liveAlerts, setLiveAlerts] = useState(null);
  const [alertHistory, setAlertHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Individual errors for panel error handling
  const [dashboardError, setDashboardError] = useState(null);
  const [alertsError, setAlertsError] = useState(null);
  const [historyError, setHistoryError] = useState(null);

  // Track whether the component is still mounted
  const mountedRef = useRef(true);

  /**
   * Fetch all three data sources concurrently.
   * Uses Promise.allSettled so one failure doesn't block the others.
   */
  const fetchAll = useCallback(async () => {
    try {
      const [dashRes, alertsRes, historyRes] = await Promise.allSettled([
        getDashboard(),
        getLiveAlerts(),
        getAlertHistory(),
      ]);

      // Guard: component may have unmounted during the await
      if (!mountedRef.current) return;

      let anySuccess = false;
      let usingDemoData = false;

      // --- Dashboard ---
      if (dashRes.status === "fulfilled" && dashRes.value.success) {
        setDashboard(dashRes.value.data);
        setDashboardError(null);
        anySuccess = true;
        if (dashRes.value._isDemo) usingDemoData = true;
      } else {
        const errMsg = dashRes.status === "rejected" ? dashRes.reason.message : "Failed to load stadium metrics";
        setDashboardError(errMsg);
      }

      // --- Live Alerts ---
      if (alertsRes.status === "fulfilled" && alertsRes.value.success) {
        // The API may return { status: "processing" } while generating
        if (alertsRes.value.status === "processing") {
          setLiveAlerts(prev => (prev ? { ...prev, status: "processing" } : { status: "processing", alerts: [] }));
        } else {
          setLiveAlerts({
            generatedAt: alertsRes.value.generatedAt,
            anomalyCount: alertsRes.value.anomalyCount,
            alerts: alertsRes.value.alerts || [],
            status: "ready"
          });
        }
        setAlertsError(null);
        anySuccess = true;
        if (alertsRes.value._isDemo) usingDemoData = true;
      } else {
        const errMsg = alertsRes.status === "rejected" ? alertsRes.reason.message : "Failed to load live AI directives";
        setAlertsError(errMsg);
      }

      // --- Alert History ---
      if (historyRes.status === "fulfilled" && historyRes.value.success) {
        setAlertHistory(historyRes.value.history || []);
        setHistoryError(null);
        anySuccess = true;
        if (historyRes.value._isDemo) usingDemoData = true;
      } else {
        const errMsg = historyRes.status === "rejected" ? historyRes.reason.message : "Failed to load historical directive log";
        setHistoryError(errMsg);
      }

      // Update connection & demo state
      setIsConnected(anySuccess);
      setIsDemoMode(usingDemoData);

      if (anySuccess) {
        setError(null);
        setLastUpdated(new Date());
      } else {
        // All three failed — surface the first error
        const firstErr =
          dashRes.status === "rejected"
            ? dashRes.reason.message
            : alertsRes.status === "rejected"
            ? alertsRes.reason.message
            : "Failed to fetch data";
        setError(firstErr);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err.message);
      setIsConnected(false);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Initial fetch + interval
  useEffect(() => {
    mountedRef.current = true;

    // Fire the first fetch immediately
    fetchAll();

    // Set up the 10-second polling loop
    const intervalId = setInterval(fetchAll, REFRESH_INTERVAL);

    return () => {
      mountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [fetchAll]);

  return {
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
    refresh: fetchAll,
  };
}
