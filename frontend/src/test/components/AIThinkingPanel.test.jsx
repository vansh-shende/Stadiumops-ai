/**
 * =========================================================
 *  AIThinkingPanel — Unit Tests
 * =========================================================
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import AIThinkingPanel from "components/dashboard/alerts/AIThinkingPanel";

// Mock helpers
vi.mock("utils/helpers", () => ({
  classifyAlert: vi.fn((msg) => (msg.includes("CRITICAL") ? "danger" : "info")),
  parseAlert: vi.fn((msg) => ({ tag: msg.includes("CRITICAL") ? "CRITICAL" : "INFO", message: msg })),
}));

let mockSimulation = {
  activeSimulation: null,
  isSimulating: false,
};

vi.mock("context/SimulationContext", () => ({
  useSimulation: () => mockSimulation,
}));

describe("AIThinkingPanel component", () => {
  beforeEach(() => {
    mockSimulation = {
      activeSimulation: null,
      isSimulating: false,
    };
    vi.clearAllMocks();
  });

  test("renders loading state correctly", () => {
    render(
      <AIThinkingPanel loading={true} liveAlerts={null} lastUpdated={null} error={null} />
    );
    expect(screen.getByText("Initializing AI subsystems…")).toBeInTheDocument();
  });

  test("renders error status and invokes onRetry callback", () => {
    const handleRetry = vi.fn();
    render(
      <AIThinkingPanel
        loading={false}
        liveAlerts={null}
        lastUpdated={null}
        error="Network timeout"
        onRetry={handleRetry}
      />
    );
    expect(screen.getByText("Directives Offline")).toBeInTheDocument();
    expect(screen.getByText("Network timeout")).toBeInTheDocument();
    
    const retryBtn = screen.getByRole("button", { name: "Retry loading AI directives" });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  test("renders nominal alerts message and layout details", () => {
    const alerts = {
      status: "ready",
      anomalyCount: 0,
      alerts: ["[INFO] Gate traffic normal."],
    };
    const lastUpdated = new Date();

    render(
      <AIThinkingPanel
        loading={false}
        liveAlerts={alerts}
        lastUpdated={lastUpdated}
        error={null}
      />
    );

    expect(screen.getByText("AI Tactical Commander")).toBeInTheDocument();
    expect(screen.getAllByText("Monitoring")[0]).toBeInTheDocument();
    expect(screen.getByText("CONFIDENCE")).toBeInTheDocument();
    expect(screen.getByText("ESTIMATED IMPACT")).toBeInTheDocument();
  });

  test("correctly renders reasoning modal and handles opening/closing", () => {
    const alerts = {
      status: "ready",
      anomalyCount: 1,
      alerts: ["[CRITICAL] High capacity wait time."],
    };

    render(
      <AIThinkingPanel
        loading={false}
        liveAlerts={alerts}
        lastUpdated={new Date()}
        error={null}
      />
    );

    const viewReasoningBtn = screen.getByRole("button", { name: "View Reasoning details" });
    fireEvent.click(viewReasoningBtn);

    expect(screen.getByText("AI Decision Logic & Evaluations")).toBeInTheDocument();
    expect(screen.getByText("Wait Time Threshold Check")).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: "Close reasoning modal" });
    fireEvent.click(closeBtn);

    expect(screen.queryByText("AI Decision Logic & Evaluations")).toBeNull();
  });

  test("handles active simulation context state changes", () => {
    mockSimulation = {
      isSimulating: true,
      activeSimulation: {
        aiState: "RISK_MODELING",
        directive: "[CRITICAL] Evacuation simulation active.",
        riskOverride: 50,
      },
    };

    render(
      <AIThinkingPanel
        loading={false}
        liveAlerts={null}
        lastUpdated={new Date()}
        error={null}
      />
    );

    expect(screen.getByText("SIMULATION ACTIVE")).toBeInTheDocument();
    expect(screen.getAllByText("Risk Modeling")[0]).toBeInTheDocument();
  });
});
