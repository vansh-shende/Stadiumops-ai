/**
 * =========================================================
 *  StadiumOverview — Unit Tests
 * =========================================================
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import StadiumOverview from "components/dashboard/map/StadiumOverview";
import { postGateAction } from "../../services/api";

// Mock API layer
vi.mock("../../services/api", () => ({
  postGateAction: vi.fn(),
}));

// Mock helper utility modules
vi.mock("../../utils/helpers", () => ({
  densityTier: vi.fn((val) => (val >= 75 ? "high" : val >= 50 ? "medium" : "low")),
  waitTier: vi.fn((val) => (val >= 15 ? "high" : val >= 10 ? "medium" : "low")),
}));

describe("StadiumOverview component", () => {
  const mockGates = [
    { id: 1, gate_name: "Gate A - Main Entrance", crowd_density: 35, wait_time: 5 },
    { id: 2, gate_name: "Gate B - North Stand", crowd_density: 80, wait_time: 25 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders loading skeleton display", () => {
    const { container } = render(
      <StadiumOverview loading={true} gates={[]} liveAlerts={null} isConnected={false} />
    );
    const skeleton = container.querySelector(".skeleton");
    expect(skeleton).toBeInTheDocument();
  });

  test("renders error status window", () => {
    render(
      <StadiumOverview
        loading={false}
        gates={[]}
        liveAlerts={null}
        isConnected={false}
        error="Gateway timeout"
      />
    );
    expect(screen.getByText("Offline")).toBeInTheDocument();
    expect(screen.getByText("Gateway timeout")).toBeInTheDocument();
  });

  test("renders active gates and metrics on map successfully", () => {
    render(
      <StadiumOverview
        loading={false}
        gates={mockGates}
        liveAlerts={{ anomalyCount: 1 }}
        isConnected={true}
      />
    );

    expect(screen.getByText("Operations Map")).toBeInTheDocument();
    expect(screen.getByText("DIGITAL TWIN")).toBeInTheDocument();
    expect(screen.getByText(/HEALTH/i)).toBeInTheDocument();
    expect(screen.getByText(/CAPACITY/i)).toBeInTheDocument();
    expect(screen.getByText(/MATCH TIME/i)).toBeInTheDocument();

    // Map labels of Gates (Gate A and Gate B without stand suffixes)
    expect(screen.getByText("Gate A")).toBeInTheDocument();
    expect(screen.getByText("Gate B")).toBeInTheDocument();
  });

  test("clicking gate opens operational override modal and handles actions", async () => {
    const handleActionComplete = vi.fn();
    postGateAction.mockResolvedValue({ success: true, message: "Action successfully dispatched." });

    render(
      <StadiumOverview
        loading={false}
        gates={mockGates}
        liveAlerts={{ anomalyCount: 0 }}
        isConnected={true}
        onActionComplete={handleActionComplete}
      />
    );

    // Click on Gate A button group using getByLabelText
    const gateAButton = screen.getByLabelText(/Gate Gate A/i);
    fireEvent.click(gateAButton);

    // Modal title should appear
    expect(screen.getByText(/Operations Command — Gate A/i)).toBeInTheDocument();

    // Click Auxiliary Turnstiles action
    const openAuxBtn = screen.getByRole("button", { name: "Open auxiliary turnstiles for Gate A" });
    fireEvent.click(openAuxBtn);

    await waitFor(() => {
      expect(postGateAction).toHaveBeenCalledWith("Gate A - Main Entrance", "open_auxiliary");
      expect(screen.getByText("✓ Action successfully dispatched.")).toBeInTheDocument();
    });

    expect(handleActionComplete).toHaveBeenCalledTimes(1);

    // Close the modal
    const closeBtn = screen.getByRole("button", { name: "Close command dialog" });
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/Operations Command — Gate A/i)).toBeNull();
  });

  test("modal handles action failure gracefully", async () => {
    postGateAction.mockResolvedValue({ success: false, error: "System failure override denied." });

    render(
      <StadiumOverview
        loading={false}
        gates={mockGates}
        liveAlerts={{ anomalyCount: 0 }}
        isConnected={true}
      />
    );

    const gateAButton = screen.getByLabelText(/Gate Gate A/i);
    fireEvent.click(gateAButton);

    const openAuxBtn = screen.getByRole("button", { name: "Open auxiliary turnstiles for Gate A" });
    fireEvent.click(openAuxBtn);

    await waitFor(() => {
      expect(screen.getByText("⚠ System failure override denied.")).toBeInTheDocument();
    });
  });
});
