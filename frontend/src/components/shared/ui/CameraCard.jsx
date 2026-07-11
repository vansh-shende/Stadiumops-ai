import React from "react";

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
