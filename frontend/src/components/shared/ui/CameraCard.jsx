import React from "react";

/**
 * CameraCard — Renders an interactive feed viewport container for CCTV camera displays.
 *
 * Implements camera metadata overlays, a scanlines grid, flickering/noise elements,
 * recording status dots, and status indicator bars.
 *
 * @param {Object} props
 * @param {string} props.camId - Identifier code of the camera (e.g. "CAM-01").
 * @param {string} props.label - Friendly name label of the camera feed.
 * @param {string} props.imageSrc - URL/source path to CCTV frame image.
 * @param {"success"|"warning"|"danger"} [props.status="success"] - Online status of feed.
 * @param {string} [props.statusLabel] - Text label overrides for feed status.
 * @param {string} props.timestamp - CCTV display timestamp string.
 * @param {boolean} [props.activeOverlay=false] - Whether to render active security overlay.
 * @param {string} [props.overlayLabel] - Text label shown inside overlay.
 * @param {boolean} [props.rec=true] - Whether to display recording indicators.
 * @returns {React.ReactElement} The rendered CameraCard component.
 */
export default React.memo(function CameraCard({
  camId,
  label,
  imageSrc,
  status = "success", // "success", "warning", "danger"
  statusLabel,
  timestamp,
  activeOverlay = false,
  overlayLabel,
  rec = true,
}) {
  const statusLabels = {
    success: "ONLINE",
    warning: "SIGNAL WEAK",
    danger: "ANOMALY",
  };

  return (
    <div className="camera-feed">
      <div className="camera-feed__viewport">
        <img
          src={imageSrc}
          alt={`CCTV Feed ${camId}`}
          className="camera-feed__image"
          loading="lazy"
        />
        <div className="camera-feed__scanlines" />
        <div className="camera-feed__scanline-move" />
        <div className="camera-feed__flicker" />
        
        <div className="camera-feed__cam-id">
          {rec && <span className="camera-feed__rec-dot" />}
          {camId}
        </div>

        <div className="camera-feed__timestamp">{timestamp}</div>

        <div className={`camera-feed__status camera-feed__status--${status}`}>
          <span className={`camera-feed__status-dot camera-feed__status-dot--${status}`} />
          {statusLabel || statusLabels[status] || "OFFLINE"}
        </div>

        {activeOverlay && overlayLabel && (
          <div className="camera-feed__overlay">
            <div className="camera-feed__overlay-badge">{overlayLabel}</div>
          </div>
        )}
      </div>
      <div className="camera-feed__label">{label}</div>
    </div>
  );
});
