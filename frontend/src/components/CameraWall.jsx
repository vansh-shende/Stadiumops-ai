/**
 * =========================================================
 *  StadiumOps AI — Live Camera Wall (Feature 3)
 * =========================================================
 *
 *  Four professional camera feed widgets with realistic
 *  placeholder images, LIVE status indicators, and
 *  color-coded severity badges.
 */

import { useState, useEffect } from "react";
import { useSimulation } from "../context/SimulationContext";

const CAMERAS = [
  {
    id: "cam-gate-a",
    label: "Gate A — Main Entrance",
    camId: "CAM-A1",
    image: "/cameras/gate-a.png",
    defaultStatus: "green",
    defaultLabel: "NOMINAL",
  },
  {
    id: "cam-gate-d",
    label: "Gate D — South Stand",
    camId: "CAM-D4",
    image: "/cameras/gate-d.png",
    defaultStatus: "yellow",
    defaultLabel: "ELEVATED",
  },
  {
    id: "cam-food",
    label: "Food Court",
    camId: "CAM-F2",
    image: "/cameras/food-court.png",
    defaultStatus: "green",
    defaultLabel: "NOMINAL",
  },
  {
    id: "cam-parking",
    label: "Parking Lot",
    camId: "CAM-P1",
    image: "/cameras/parking.png",
    defaultStatus: "green",
    defaultLabel: "NOMINAL",
  },
];

export default function CameraWall() {
  const [clock, setClock] = useState("");
  const { activeSimulation, isSimulating } = useSimulation();

  // Real-time clock for camera timestamp overlay
  useEffect(() => {
    function tick() {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      setClock(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // During crowd surge simulation, Gate D goes critical
  const getCameraStatus = (cam) => {
    if (isSimulating && activeSimulation?.key === "crowdSurge" && cam.id === "cam-gate-d") {
      return { status: "red", label: "CRITICAL" };
    }
    if (isSimulating && activeSimulation?.key === "emergencyTeam" && cam.id === "cam-food") {
      return { status: "red", label: "ALERT" };
    }
    return { status: cam.defaultStatus, label: cam.defaultLabel };
  };

  return (
    <article
      className="card camera-wall"
      id="camera-wall-panel"
      tabIndex="0"
      aria-label="Live Camera Surveillance Feeds"
    >
      <div className="card__header">
        <h2 className="card__title">
          <span className="card__title-icon">📹</span>
          Surveillance Feeds
        </h2>
        <div className="camera-wall__live-badge">
          <span className="camera-wall__live-dot" />
          LIVE
        </div>
      </div>

      <div className="card__body camera-grid">
        {CAMERAS.map((cam) => {
          const { status, label } = getCameraStatus(cam);
          const statusClass = status === "red" ? "danger" : status === "yellow" ? "warning" : "success";

          return (
            <div key={cam.id} className="camera-feed" id={cam.id}>
              <div className="camera-feed__viewport">
                <img
                  src={cam.image}
                  alt={`Live feed from ${cam.label}`}
                  className="camera-feed__image"
                  loading="lazy"
                />
                {/* Scanline overlay for authentic CCTV feel */}
                <div className="camera-feed__scanlines" aria-hidden="true" />
                <div className="camera-feed__scanline-move" aria-hidden="true" />
                <div className="camera-feed__flicker" aria-hidden="true" />

                {/* Top-left camera ID */}
                <div className="camera-feed__cam-id">
                  <span className="camera-feed__rec-dot" />
                  {cam.camId}
                </div>

                {/* Bottom timestamp */}
                <div className="camera-feed__timestamp">{clock}</div>

                {/* Status indicator */}
                <div className={`camera-feed__status camera-feed__status--${statusClass}`}>
                  <span className={`camera-feed__status-dot camera-feed__status-dot--${statusClass}`} />
                  {label}
                </div>
              </div>
              <div className="camera-feed__label">{cam.label}</div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
