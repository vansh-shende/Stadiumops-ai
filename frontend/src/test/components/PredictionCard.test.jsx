/**
 * =========================================================
 *  PredictionCard — Unit Tests
 * =========================================================
 */

import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import PredictionCard from "components/shared/ui/PredictionCard";

describe("PredictionCard component", () => {
  test("renders text information correctly", () => {
    render(
      <PredictionCard
        location="North Gate"
        badgeText="HIGH"
        metricLabel="Wait Time Probability"
        probability={85}
        action="Deploy Staff"
        reduction="25%"
        eta="10 min"
        variant="danger"
      />
    );

    expect(screen.getByText("North Gate")).toBeInTheDocument();
    expect(screen.getByText("HIGH")).toBeInTheDocument();
    expect(screen.getByText("Wait Time Probability")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("10 min")).toBeInTheDocument();
    expect(screen.getByText("Deploy Staff")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
  });

  test("clamps variants to specific styles", () => {
    const { container } = render(
      <PredictionCard
        location="Gate B"
        badgeText="LOW"
        metricLabel="Traffic"
        probability={10}
        action="None"
        reduction="0%"
        variant="warning"
      />
    );
    expect(container.firstChild).toHaveClass("prediction-card--warning");
  });

  test("does not crash if eta is missing", () => {
    render(
      <PredictionCard
        location="Gate C"
        badgeText="MED"
        metricLabel="Traffic"
        probability={50}
        action="Inspect"
        reduction="5%"
      />
    );
    expect(screen.queryByText("ETA")).toBeNull();
  });
});
