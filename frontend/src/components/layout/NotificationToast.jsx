/**
 * NotificationToast — Top-right floating toast notifications
 * that auto-dismiss after 3 seconds. Triggered on new AI alerts.
 */
import { useState, useEffect, useRef } from "react";
import { useSimulation } from "../../context/SimulationContext";

export default function NotificationToast({ liveAlerts, lastUpdated }) {
  const [toasts, setToasts] = useState([]);
  const prevAlertRef = useRef(null);
  const prevSimKeyRef = useRef(null);
  const { activeSimulation } = useSimulation();

  useEffect(() => {
    // 1. Check for simulation changes
    if (activeSimulation && activeSimulation.key !== prevSimKeyRef.current) {
      prevSimKeyRef.current = activeSimulation.key;
      const id = Date.now();
      const isCritical = activeSimulation.directive.startsWith("[CRITICAL]");
      const isWarning = activeSimulation.directive.startsWith("[WARNING]");
      const variant = isCritical ? "danger" : isWarning ? "warning" : "info";

      setToasts((prev) => [
        ...prev.slice(-2),
        { id, message: "AI Recommendation Generated", variant, timestamp: new Date() },
      ]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
      return;
    }

    if (!activeSimulation) {
      prevSimKeyRef.current = null;
    }

    // 2. Check for real liveAlerts changes
    if (!liveAlerts || !liveAlerts.alerts || liveAlerts.alerts.length === 0) return;
    const latestAlert = liveAlerts.alerts[0];
    if (latestAlert === prevAlertRef.current) return;
    prevAlertRef.current = latestAlert;

    const id = Date.now();
    const isCritical = latestAlert.startsWith("[CRITICAL]");
    const isWarning = latestAlert.startsWith("[WARNING]");
    const variant = isCritical ? "danger" : isWarning ? "warning" : "info";

    setToasts((prev) => [
      ...prev.slice(-2),
      { id, message: "AI Recommendation Generated", variant, timestamp: new Date() },
    ]);

    // Auto-remove after 3.5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, [liveAlerts, lastUpdated, activeSimulation]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.variant}`}>
          <div className="toast__icon">
            {toast.variant === "danger" ? "🚨" : toast.variant === "warning" ? "⚠️" : "🤖"}
          </div>
          <div className="toast__body">
            <span className="toast__title">{toast.message}</span>
            <span className="toast__time">
              {toast.timestamp.toLocaleTimeString("en-US", { hour12: false })}
            </span>
          </div>
          <div className="toast__progress">
            <div className={`toast__progress-bar toast__progress-bar--${toast.variant}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
