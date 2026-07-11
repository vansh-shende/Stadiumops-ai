/**
 * StadiumOps AI — Global Dashboard Constants
 */

export const THRESHOLDS = {
  DENSITY: {
    LOW: 50,
    MEDIUM: 80,
  },
  WAIT: {
    LOW: 5,
    MEDIUM: 15,
  },
  INVENTORY: {
    LOW: 30,
    MEDIUM: 80,
  },
};

export const DEFAULT_PREDICTIONS = [
  {
    id: 1,
    gate: "Gate C",
    metric: "Congestion Probability",
    probability: 91,
    eta: "4 min",
    action: "Open Overflow Gate",
    reduction: "38%",
    severity: "danger",
  },
  {
    id: 2,
    gate: "Gate B",
    metric: "Wait Time Escalation",
    probability: 67,
    eta: "8 min",
    action: "Redistribute Queue",
    reduction: "22%",
    severity: "warning",
  },
  {
    id: 3,
    gate: "Food Court",
    metric: "Stockout Risk",
    probability: 45,
    eta: "12 min",
    action: "Priority Restock",
    reduction: "15%",
    severity: "info",
  },
];

export const CAMERAS = [
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

export const QUICK_ACTIONS = [
  {
    key: "crowdSurge",
    label: "Simulate Crowd Surge",
    icon: "⚡",
    description: "Trigger a mass ingress event at Gate D",
    variant: "danger",
  },
  {
    key: "overflowGate",
    label: "Open Overflow Gate",
    icon: "🚪",
    description: "Activate Gate D2 overflow protocol",
    variant: "warning",
  },
  {
    key: "emergencyTeam",
    label: "Deploy Emergency Team",
    icon: "🚑",
    description: "Dispatch medical team Alpha to Section 14B",
    variant: "danger",
  },
  {
    key: "broadcast",
    label: "Broadcast Announcement",
    icon: "📢",
    description: "PA system advisory for crowd management",
    variant: "info",
  },
];
