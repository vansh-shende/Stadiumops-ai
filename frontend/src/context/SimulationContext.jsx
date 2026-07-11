/**
 * =========================================================
 *  StadiumOps AI — Simulation Context
 * =========================================================
 *
 *  Provides a frontend-only simulation layer that overlays
 *  "crisis" data on top of the real API data, enabling
 *  Quick Action buttons to trigger immersive scenarios
 *  without touching the backend.
 */

import { createContext, useContext, useState, useCallback, useRef } from "react";

const SimulationContext = createContext(null);

/** Duration of a simulation in milliseconds. */
const SIMULATION_DURATION = 12_000;

/** Pre-built scenario definitions. */
const SCENARIOS = {
  crowdSurge: {
    name: "Crowd Surge",
    aiState: "ANALYZING",
    riskOverride: 92,
    directive: "[CRITICAL] Massive crowd surge detected at Gate D — occupancy at 97%. Immediate overflow gate activation and crowd diversion protocols required.",
    gateOverrides: {
      "Gate D - South Stand": { crowd_density: 97, wait_time: 28 },
      "Gate C - East Wing": { crowd_density: 82, wait_time: 18 },
    },
    timelineEntry: {
      type: "critical",
      message: "SIMULATION: Crowd surge scenario activated — Gate D at critical capacity",
    },
    prediction: {
      gate: "Gate D",
      probability: 97,
      eta: "2 min",
      action: "Activate Overflow Gate D2",
      reduction: "42%",
    },
  },
  overflowGate: {
    name: "Overflow Gate",
    aiState: "DEPLOYING",
    riskOverride: 55,
    directive: "[WARNING] Overflow Gate D2 activated. Redirecting 340 spectators per minute. Expected congestion relief in 3 minutes.",
    gateOverrides: {
      "Gate D - South Stand": { crowd_density: 68, wait_time: 12 },
    },
    timelineEntry: {
      type: "warning",
      message: "SIMULATION: Overflow Gate D2 opened — crowd redistribution in progress",
    },
    prediction: {
      gate: "Gate D2 (Overflow)",
      probability: 68,
      eta: "3 min",
      action: "Monitor redistribution",
      reduction: "28%",
    },
  },
  emergencyTeam: {
    name: "Emergency Deploy",
    aiState: "DEPLOYING",
    riskOverride: 78,
    directive: "[CRITICAL] Emergency medical team Alpha dispatched to Section 14B. ETA 90 seconds. Security perimeter established.",
    gateOverrides: {},
    timelineEntry: {
      type: "critical",
      message: "SIMULATION: Emergency team Alpha deployed to Section 14B",
    },
    prediction: {
      gate: "Section 14B",
      probability: 85,
      eta: "90 sec",
      action: "Medical Response Protocol",
      reduction: "N/A",
    },
  },
  broadcast: {
    name: "Broadcast",
    aiState: "GENERATING_PLAN",
    riskOverride: 45,
    directive: "[WARNING] Public address system broadcasting crowd management advisory for Gates B and E. Expected compliance in 4 minutes.",
    gateOverrides: {
      "Gate B - North Stand": { crowd_density: 58, wait_time: 9 },
      "Gate E - VIP Entrance": { crowd_density: 52, wait_time: 7 },
    },
    timelineEntry: {
      type: "warning",
      message: "SIMULATION: PA broadcast initiated for Gates B & E congestion advisory",
    },
    prediction: {
      gate: "Gates B & E",
      probability: 62,
      eta: "4 min",
      action: "PA Advisory Broadcast",
      reduction: "18%",
    },
  },
};

export function SimulationProvider({ children }) {
  const [activeSimulation, setActiveSimulation] = useState(null);
  const [simulationLog, setSimulationLog] = useState([]);
  const timerRef = useRef(null);

  const runSimulation = useCallback((scenarioKey) => {
    const scenario = SCENARIOS[scenarioKey];
    if (!scenario) return;

    // Clear any existing simulation timer
    if (timerRef.current) clearTimeout(timerRef.current);

    // Activate simulation
    setActiveSimulation({ key: scenarioKey, ...scenario, startedAt: Date.now() });

    // Add to simulation log
    setSimulationLog((prev) => [
      {
        ...scenario.timelineEntry,
        timestamp: new Date().toISOString(),
        scenarioKey,
      },
      ...prev.slice(0, 9),
    ]);

    // Auto-clear after duration
    timerRef.current = setTimeout(() => {
      setActiveSimulation(null);
    }, SIMULATION_DURATION);
  }, []);

  const clearSimulation = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveSimulation(null);
  }, []);

  return (
    <SimulationContext.Provider
      value={{
        activeSimulation,
        simulationLog,
        runSimulation,
        clearSimulation,
        isSimulating: activeSimulation !== null,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
}
