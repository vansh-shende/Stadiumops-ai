import { useState, useEffect, memo } from "react";
import { useSimulation } from "../../../context/SimulationContext";
import { CAMERAS } from "../../../constants/dashboardConstants";
import Card from "../../shared/ui/Card";
import CameraCard from "../../shared/ui/CameraCard";

export default memo(function CameraWall() {
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
      return { status: "danger", label: "CRITICAL" };
    }
    if (isSimulating && activeSimulation?.key === "emergencyTeam" && cam.id === "cam-food") {
      return { status: "danger", label: "ALERT" };
    }
    const statusClass = cam.defaultStatus === "green" ? "success" : cam.defaultStatus === "yellow" ? "warning" : "danger";
    return { status: statusClass, label: cam.defaultLabel };
  };

  return (
    <Card
      title="Surveillance Feeds"
      icon="📹"
      headerRight={
        <div className="camera-wall__live-badge">
          <span className="camera-wall__live-dot" />
          LIVE
        </div>
      }
      className="camera-wall"
      id="camera-wall-panel"
    >
      <div className="card__body camera-grid">
        {CAMERAS.map((cam) => {
          const { status, label } = getCameraStatus(cam);
          return (
            <CameraCard
              key={cam.id}
              camId={cam.camId}
              label={cam.label}
              imageSrc={cam.image}
              status={status}
              statusLabel={label}
              timestamp={clock}
            />
          );
        })}
      </div>
    </Card>
  );
});
