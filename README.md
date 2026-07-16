# StadiumOps AI — FIFA 2026 Real-Time Command Center

StadiumOps AI is a production-grade, real-time command center dashboard designed for managing FIFA 2026 stadium operations. By combining live telemetry streams (gate congestion, concession inventory, staff availability) with predictive intelligence and an autonomous AI Director powered by Google Gemini, the platform enables stadium managers to monitor stadium status and trigger rapid mitigation protocols.

---

## 🛠️ Technology Stack

### Frontend (Client-side)
* **Core:** React 19 + JavaScript (ES6+)
* **Build Tooling:** Vite (optimized code-splitting and asset minification)
* **Styling:** Vanilla CSS (custom variables, premium dark-mode theme, GPU-accelerated layouts)
* **Visuals & Charts:** Recharts (responsive vector charts), custom HTML5 Canvas overlays, and CSS-driven digital twin map nodes

### Backend (Server-side)
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** SQLite3 with Write-Ahead Logging (WAL) enabled for high concurrent read efficiency
* **AI Engine:** Google Gemini SDK (`@google/genai` v2.10) with automatic rule-engine fallback

---

## 🏗️ Architecture & Refactoring Achievements

This codebase has been audited and refactored under Senior Staff Software Engineer principles to achieve maximum maintainability, performance, and scalability.

1. **Atomic UI Component System (`src/components/shared/ui/`):**
   * Extracted monolithic component styling into reusable, high-fidelity atomic UI units: `Card`, `Badge`, `Button`, `StatusChip`, `ProgressBar`, `MetricCard`, `TimelineItem`, `PredictionCard`, and `CameraCard`.
2. **Unified System Constants (`src/constants/`):**
   * Migrated all hardcoded values, wait times, inventory levels, and threshold configurations into a single module-level source of truth: `dashboardConstants.js`.
3. **DRY Backend Data Access:**
   * Consolidated database querying logic into `stadiumDataService.js` and refactored `dashboardController.js` to reuse it, eliminating duplicate raw SQL queries.
4. **Hanging connection protection (Gemini API Timeout):**
   * Added an 8-second promise timeout safety race to external model requests. If the network drops or API latency spikes, the system automatically falls back to rule-based backup directives without blocking the 10-second background ticker.
5. **GPU-Accelerated & Code-Split Performance:**
   * Leveraged React Suspense and lazy-loading boundaries for all heavy dashboard panels, optimizing First Contentful Paint (FCP) and Total Blocking Time (TBT).

---

## 📁 Repository Structure

```text
StadiumOps-AI/
├── backend/
│   ├── config/             # Database connection configuration (WAL setup)
│   ├── controllers/        # Business logic controllers (gates, inventory, staff, dashboard, AI)
│   ├── database/           # SQLite databases, schema creation, and seeding logic
│   ├── prompts/            # System instruction prompts and prompt-building modules
│   ├── routes/             # Thin Express route mappings
│   ├── services/           # Services (Gemini integration, background alert scheduler, rules engine)
│   ├── utils/              # Colour-coded logging utility
│   ├── server.js           # Server bootstrap entrypoint
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/  # Sub-panels (alerts, charts, maps, surveillance)
│   │   │   ├── layout/     # Structural app layout (Header, BackgroundGrid, Toasts)
│   │   │   └── shared/ui/  # Reusable atomic UI atoms
│   │   ├── constants/      # Dashboard thresholds and settings
│   │   ├── context/        # Simulation and overlay context
│   │   ├── hooks/          # Polling hooks and API sync logic
│   │   ├── services/       # HTTP requests layer
│   │   ├── utils/          # Formatting helpers and metric computer
│   │   ├── App.jsx         # App assembly, lazy loading, and fallback screens
│   │   ├── index.css       # Layout styles and custom token variables
│   │   └── main.jsx
│   └── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18+) installed.

### 2. Setting Up the Backend
Navigate to the `backend` directory, install packages, and set up your configuration:
```bash
cd backend
npm install
cp .env.example .env
```
Open `.env` and add your Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```
Run the development server:
```bash
npm run dev
```

### 3. Setting Up the Frontend
Navigate to the `frontend` directory, install packages, and run the client:
```bash
cd ../frontend
npm install
npm run dev
```
Open [https://frontend-xi-six-14.vercel.app/) in your web browser.

### 4. Running the Telemetry Simulator
To simulate real-time crowd, inventory, and staff fluctuations in the database every 10 seconds:
```bash
cd ../backend
npm run simulate
```
This runs a separate worker process mutating SQLite metrics, which automatically flow into your dashboard in real-time.
