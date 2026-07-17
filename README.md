# StadiumOps AI — FIFA 2026 Real-Time Command Center

StadiumOps AI is a production-grade, real-time command center dashboard designed for managing FIFA 2026 stadium operations. By combining live telemetry streams (gate congestion, concession inventory, staff availability) with predictive intelligence and an autonomous AI Director powered by Google Gemini, the platform enables stadium managers to monitor stadium status and trigger rapid mitigation protocols.

---

## 🛠️ Technology Stack

### Frontend (Client-side)
* **Core:** React 19 + JavaScript (ES6+)
* **Build Tooling:** Vite (optimized code-splitting and asset minification)
* **Styling:** Vanilla CSS (custom variables, premium dark-mode theme, GPU-accelerated layouts)
* **Visuals & Charts:** Recharts (responsive vector charts), custom HTML5 Canvas overlays, and CSS-driven digital twin map nodes
* **Accessibility:** WCAG 2.1 AA compliant — skip navigation, ARIA landmarks, keyboard focus management, `prefers-reduced-motion` support, high contrast mode

### Backend (Server-side)
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** SQLite3 with Write-Ahead Logging (WAL) enabled for high concurrent read efficiency
* **AI Engine:** Google Gemini SDK (`@google/genai` v2.10) with automatic rule-engine fallback
* **Security:** Helmet, CORS origin whitelist, express-validator input sanitisation, rate limiting, body size limits, global error handler
* **Testing:** Jest (59 tests across 4 suites — rule engine, prompt builder, alert engine, middleware)

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

## 🔒 Security Architecture (Defence-in-Depth)

| Layer | Implementation |
|-------|---------------|
| **HTTP Headers** | Helmet.js — XSS protection, HSTS, content-type sniffing prevention |
| **CORS** | Origin whitelist — only known frontend domains permitted |
| **Rate Limiting** | Per-IP throttling (5000 req / 15 min) with standard headers |
| **Body Size Limit** | `express.json({ limit: '100kb' })` — prevents payload-based DoS |
| **Input Validation** | express-validator middleware with whitelisted values & HTML escape |
| **Error Sanitisation** | Global error handler — internal details logged, never leaked to client |
| **AI Prompt Safety** | Tactical Commander prompt with strict output format rules |
| **Parameterised SQL** | All database queries use bind parameters — zero raw interpolation |

---

## ♿ Accessibility (WCAG 2.1 AA)

| Feature | Implementation |
|---------|---------------|
| **Skip Navigation** | `<a href="#main-content">` skip link in `index.html` |
| **Semantic Landmarks** | `<main>`, `<article>`, `<nav>` — proper document structure |
| **Keyboard Navigation** | `:focus-visible` styles with high-contrast outlines on all interactive elements |
| **Screen Readers** | `aria-label`, `aria-live="polite"`, `role="progressbar"`, `role="dialog"` with `aria-modal` |
| **Reduced Motion** | `@media (prefers-reduced-motion: reduce)` disables all animations |
| **High Contrast** | `@media (forced-colors: active)` support for Windows High Contrast mode |
| **Modal Focus Trap** | Escape key handler + `aria-labelledby` / `aria-describedby` on dialogs |
| **Decorative Icons** | `aria-hidden="true"` on all emoji/SVG decorative elements |

---

## 🧪 Testing Strategy

```text
Test Suites: 4 passed, 4 total
Tests:       59 passed, 59 total

  ✓ stadium.test.js      — 29 tests (rule engine, anomaly detection, fallback directives)
  ✓ promptBuilder.test.js — 11 tests (prompt construction, system prompt validation)
  ✓ alertEngine.test.js   — 11 tests (caching, history, custom action injection)
  ✓ middleware.test.js     —  8 tests (validation rules, error handler sanitisation)
```

Coverage includes:
- **Boundary value analysis** — threshold edges (15, 85, 20) tested precisely
- **Input validation** — null, undefined, missing fields, empty arrays
- **Security** — error message sanitisation, validation chain enforcement
- **Combined scenarios** — multi-anomaly detection, severity ordering

---

## ⚡ Efficiency Optimisations

| Technique | Benefit |
|-----------|---------|
| **Response Compression** | `compression` middleware — gzip/brotli for reduced bandwidth |
| **SQLite WAL Mode** | Concurrent reads during writes — no blocking |
| **Database Indexes** | B-tree indexes on `updated_at`, `gate_name`, `zone` columns |
| **Concurrent Queries** | `Promise.all` for parallel DB reads in `getStadiumSnapshot()` |
| **Code Splitting** | Vite `manualChunks` — MUI, Recharts, Icons split into separate bundles |
| **Lazy Loading** | React.lazy + Suspense for all dashboard layouts |
| **Visibility Polling** | `document.visibilityState` check — pauses API polling when tab is hidden |
| **Component Memoisation** | `React.memo` on all UI atoms to prevent unnecessary re-renders |

---

## 📁 Repository Structure

```text
StadiumOps-AI/
├── backend/
│   ├── config/             # Database connection configuration (WAL setup)
│   ├── controllers/        # Business logic controllers (gates, inventory, staff, dashboard, AI)
│   ├── database/           # SQLite databases, schema creation, and seeding logic
│   ├── middleware/          # Error handler, input validation (express-validator)
│   ├── prompts/            # System instruction prompts and prompt-building modules
│   ├── routes/             # Thin Express route mappings
│   ├── services/           # Services (Gemini integration, background alert scheduler, rules engine)
│   ├── tests/              # Jest test suites (4 files, 59 tests)
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

### 4. Running Tests
```bash
cd backend
npm test
```

### 5. Running the Telemetry Simulator
To simulate real-time crowd, inventory, and staff fluctuations in the database every 10 seconds:
```bash
cd ../backend
npm run simulate
```
This runs a separate worker process mutating SQLite metrics, which automatically flow into your dashboard in real-time.
