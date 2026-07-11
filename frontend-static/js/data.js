/**
 * =========================================================
 *  StadiumOps AI — Dummy Data Store
 * =========================================================
 *
 *  All realistic sample data consumed by app.js lives here.
 *  This keeps data separate from rendering logic, making it
 *  easy to swap in live API data later.
 *
 *  Exposes: window.STADIUM_DATA
 */

window.STADIUM_DATA = {

  /* ----- KPI Cards ----- */
  kpis: [
    {
      id: "crowd-density",
      label: "Crowd Density",
      value: "72%",
      icon: "👥",
      variant: "warning",
      trend: "up",
      change: "8%",
      subtext: "vs last hour",
    },
    {
      id: "avg-wait",
      label: "Avg Wait Time",
      value: "12 min",
      icon: "⏱",
      variant: "danger",
      trend: "up",
      change: "3 min",
      subtext: "vs last hour",
    },
    {
      id: "inventory-health",
      label: "Inventory Health",
      value: "84%",
      icon: "📦",
      variant: "success",
      trend: "down",
      change: "2%",
      subtext: "stock remaining",
    },
    {
      id: "active-staff",
      label: "Active Staff",
      value: "6 / 10",
      icon: "🧑‍💼",
      variant: "info",
      trend: "flat",
      change: "0",
      subtext: "available now",
    },
  ],

  /* ----- Gate Traffic ----- */
  gateTraffic: [
    { name: "Gate A — Main Entrance",  crowdDensity: 87, waitTime: 30, updatedAt: "2 min ago" },
    { name: "Gate B — North Stand",    crowdDensity: 72, waitTime: 27, updatedAt: "2 min ago" },
    { name: "Gate C — East Wing",      crowdDensity: 30, waitTime: 5,  updatedAt: "2 min ago" },
    { name: "Gate D — South Stand",    crowdDensity: 60, waitTime: 16, updatedAt: "2 min ago" },
    { name: "Gate E — VIP Entrance",   crowdDensity: 18, waitTime: 3,  updatedAt: "2 min ago" },
    { name: "Gate F — West Pavilion",  crowdDensity: 55, waitTime: 10, updatedAt: "2 min ago" },
  ],

  /* ----- Concession Inventory ----- */
  inventory: [
    { stand: "Hot Dog Haven",   item: "Classic Hot Dog",   quantity: 150, updatedAt: "5 min ago" },
    { stand: "Hot Dog Haven",   item: "Veggie Dog",        quantity: 80,  updatedAt: "5 min ago" },
    { stand: "Pizza Corner",    item: "Pepperoni Slice",   quantity: 120, updatedAt: "5 min ago" },
    { stand: "Pizza Corner",    item: "Margherita Slice",  quantity: 95,  updatedAt: "5 min ago" },
    { stand: "Burger Barn",     item: "Cheeseburger",      quantity: 110, updatedAt: "5 min ago" },
    { stand: "Burger Barn",     item: "Chicken Burger",    quantity: 75,  updatedAt: "5 min ago" },
    { stand: "Drinks Station",  item: "Soda (Large)",      quantity: 200, updatedAt: "5 min ago" },
    { stand: "Drinks Station",  item: "Bottled Water",     quantity: 180, updatedAt: "5 min ago" },
    { stand: "Drinks Station",  item: "Craft Beer",        quantity: 60,  updatedAt: "5 min ago" },
    { stand: "Nachos & More",   item: "Loaded Nachos",     quantity: 13,  updatedAt: "5 min ago" },
    { stand: "Sweet Treats",    item: "Cotton Candy",      quantity: 22,  updatedAt: "5 min ago" },
    { stand: "Sweet Treats",    item: "Ice Cream Cone",    quantity: 65,  updatedAt: "5 min ago" },
  ],

  /* ----- Staff Logistics ----- */
  staff: [
    { name: "James Carter",    zone: "Gate A",          status: "Available", updatedAt: "1 min ago" },
    { name: "Priya Sharma",    zone: "North Stand",     status: "Busy",      updatedAt: "3 min ago" },
    { name: "Marcus Johnson",  zone: "East Wing",       status: "Available", updatedAt: "1 min ago" },
    { name: "Elena Rodriguez", zone: "Concession Area", status: "On Break",  updatedAt: "8 min ago" },
    { name: "David Kim",       zone: "VIP Lounge",      status: "Busy",      updatedAt: "2 min ago" },
    { name: "Aisha Patel",     zone: "South Stand",     status: "Available", updatedAt: "1 min ago" },
    { name: "Tom Wilson",      zone: "Parking Lot",     status: "Busy",      updatedAt: "4 min ago" },
    { name: "Sophie Chen",     zone: "West Pavilion",   status: "Available", updatedAt: "1 min ago" },
    { name: "Raj Mehta",       zone: "Control Room",    status: "Busy",      updatedAt: "6 min ago" },
    { name: "Olivia Brown",    zone: "First Aid",       status: "Available", updatedAt: "1 min ago" },
  ],

  /* ----- AI Tactical Alert Feed ----- */
  alerts: [
    { text: "[CRITICAL] Deploy additional staff to Gate F immediately — zero personnel on site.",           time: "10:08" },
    { text: "[CRITICAL] Gate A congestion at 87% — open overflow gate and redirect North Stand traffic.",   time: "10:08" },
    { text: "[CRITICAL] Staff shortage detected in West Pavilion — reassign from lower-priority zones.",    time: "10:07" },
    { text: "[WARNING] Gate B wait time exceeds 25 min — consider opening supplementary security lane.",    time: "10:07" },
    { text: "[WARNING] Gate D wait time at 16 min — monitor closely and prepare overflow protocol.",        time: "10:06" },
    { text: "[WARNING] North Stand has only 1 available staff member — deploy backup crew.",                 time: "10:06" },
    { text: "[INFO] Loaded Nachos stock critically low (13 units) at Nachos & More — restock now.",         time: "10:05" },
    { text: "[INFO] Cotton Candy stock at 22 units — schedule restock within 30 minutes.",                  time: "10:05" },
    { text: "[INFO] Gate C and Gate E operating within normal parameters.",                                  time: "10:04" },
    { text: "[INFO] Overall inventory health stable at 84% — no immediate action required.",                time: "10:04" },
  ],
};
