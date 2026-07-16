/**
 * =========================================================
 *  StadiumOps AI — Mock/Demo Data Fallback
 * =========================================================
 *
 *  Provides realistic demo data when the backend API is
 *  unreachable (e.g. Render free tier cold start).
 *  This ensures the Vercel-deployed frontend always loads
 *  with meaningful content instead of showing "Connection Offline".
 */

export const MOCK_DASHBOARD = {
  success: true,
  data: {
    gates: [
      { id: 1, gate_name: "Gate A - Main Entrance", crowd_density: 45, wait_time: 8, updated_at: new Date().toISOString() },
      { id: 2, gate_name: "Gate B - North Stand", crowd_density: 72, wait_time: 15, updated_at: new Date().toISOString() },
      { id: 3, gate_name: "Gate C - East Wing", crowd_density: 30, wait_time: 5, updated_at: new Date().toISOString() },
      { id: 4, gate_name: "Gate D - South Stand", crowd_density: 60, wait_time: 12, updated_at: new Date().toISOString() },
      { id: 5, gate_name: "Gate E - VIP Entrance", crowd_density: 18, wait_time: 3, updated_at: new Date().toISOString() },
      { id: 6, gate_name: "Gate F - West Pavilion", crowd_density: 55, wait_time: 10, updated_at: new Date().toISOString() },
    ],
    inventory: [
      { id: 1, stand_name: "Hot Dog Haven", item_name: "Classic Hot Dog", quantity: 45, updated_at: new Date().toISOString() },
      { id: 2, stand_name: "Hot Dog Haven", item_name: "Veggie Dog", quantity: 156, updated_at: new Date().toISOString() },
      { id: 3, stand_name: "Pizza Corner", item_name: "Pepperoni Slice", quantity: 182, updated_at: new Date().toISOString() },
      { id: 4, stand_name: "Pizza Corner", item_name: "Margherita Slice", quantity: 150, updated_at: new Date().toISOString() },
      { id: 5, stand_name: "Burger Barn", item_name: "Cheeseburger", quantity: 174, updated_at: new Date().toISOString() },
      { id: 6, stand_name: "Burger Barn", item_name: "Chicken Burger", quantity: 170, updated_at: new Date().toISOString() },
      { id: 7, stand_name: "Drinks Station", item_name: "Soda (Large)", quantity: 89, updated_at: new Date().toISOString() },
      { id: 8, stand_name: "Drinks Station", item_name: "Bottled Water", quantity: 200, updated_at: new Date().toISOString() },
      { id: 9, stand_name: "Drinks Station", item_name: "Craft Beer", quantity: 196, updated_at: new Date().toISOString() },
      { id: 10, stand_name: "Nachos & More", item_name: "Loaded Nachos", quantity: 89, updated_at: new Date().toISOString() },
      { id: 11, stand_name: "Sweet Treats", item_name: "Cotton Candy", quantity: 55, updated_at: new Date().toISOString() },
      { id: 12, stand_name: "Sweet Treats", item_name: "Ice Cream Cone", quantity: 147, updated_at: new Date().toISOString() },
    ],
    staff: [
      { id: 1, staff_name: "James Carter", zone: "Gate E", status: "Busy", updated_at: new Date().toISOString() },
      { id: 2, staff_name: "Priya Sharma", zone: "First Aid", status: "Available", updated_at: new Date().toISOString() },
      { id: 3, staff_name: "Marcus Johnson", zone: "East Wing", status: "Busy", updated_at: new Date().toISOString() },
      { id: 4, staff_name: "Elena Rodriguez", zone: "Gate A", status: "Available", updated_at: new Date().toISOString() },
      { id: 5, staff_name: "David Kim", zone: "Gate E", status: "On Break", updated_at: new Date().toISOString() },
      { id: 6, staff_name: "Aisha Patel", zone: "Concession Area", status: "Available", updated_at: new Date().toISOString() },
      { id: 7, staff_name: "Tom Wilson", zone: "VIP Lounge", status: "Busy", updated_at: new Date().toISOString() },
      { id: 8, staff_name: "Sophie Chen", zone: "Gate C", status: "Available", updated_at: new Date().toISOString() },
      { id: 9, staff_name: "Raj Mehta", zone: "Control Room", status: "On Break", updated_at: new Date().toISOString() },
      { id: 10, staff_name: "Olivia Brown", zone: "Gate B", status: "Available", updated_at: new Date().toISOString() },
    ],
    generatedAt: new Date().toISOString(),
  },
};

export const MOCK_LIVE_ALERTS = {
  success: true,
  generatedAt: new Date().toISOString(),
  anomalyCount: 3,
  alerts: [
    {
      id: "demo-1",
      type: "crowd",
      severity: "high",
      title: "High Crowd Density at Gate B",
      message: "Gate B - North Stand crowd density at 72%. Consider redirecting incoming fans to Gate C (30%) or Gate E (18%) to balance load.",
      zone: "Gate B - North Stand",
      timestamp: new Date().toISOString(),
      action: "Redirect crowd to Gate C or Gate E",
    },
    {
      id: "demo-2",
      type: "inventory",
      severity: "medium",
      title: "Low Stock: Classic Hot Dog",
      message: "Hot Dog Haven Classic Hot Dog stock is running low at 45 units. Recommend immediate resupply from central kitchen.",
      zone: "Hot Dog Haven",
      timestamp: new Date().toISOString(),
      action: "Resupply from central kitchen",
    },
    {
      id: "demo-3",
      type: "security",
      severity: "low",
      title: "Staff Reallocation Suggested",
      message: "Gate A has 1 available staff while Gate B (high density) needs additional support. Consider reassigning Elena Rodriguez.",
      zone: "Gate A - Main Entrance",
      timestamp: new Date().toISOString(),
      action: "Reassign available staff to Gate B",
    },
  ],
};

export const MOCK_ALERT_HISTORY = {
  success: true,
  count: 2,
  history: [
    {
      id: "hist-1",
      generatedAt: new Date(Date.now() - 600000).toISOString(),
      anomalyCount: 2,
      alerts: [
        {
          type: "crowd",
          severity: "high",
          title: "Gate D congestion detected",
          message: "South Stand gate experiencing above-normal density.",
        },
        {
          type: "inventory",
          severity: "medium",
          title: "Drinks Station low on Soda",
          message: "Soda (Large) stock approaching critical threshold.",
        },
      ],
    },
    {
      id: "hist-2",
      generatedAt: new Date(Date.now() - 1200000).toISOString(),
      anomalyCount: 1,
      alerts: [
        {
          type: "security",
          severity: "low",
          title: "VIP area staffing gap",
          message: "VIP Lounge is down to one staff member during peak hours.",
        },
      ],
    },
  ],
};
