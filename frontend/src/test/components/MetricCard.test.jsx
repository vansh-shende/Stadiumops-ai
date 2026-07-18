/**
 * =========================================================
 *  MetricCard — Unit Tests
 * =========================================================
 */

import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import MetricCard from "components/shared/ui/MetricCard";

describe("MetricCard component", () => {
  test("renders label, value, and status text correctly", () => {
    render(
      <MetricCard
        label="Total Attendance"
        value="45,000"
        icon="👥"
        statusLabel="Nominal"
      />
    );
    const card = screen.getByRole("region");
    expect(card).toHaveAttribute("aria-label", "Total Attendance: 45,000, status Nominal");
    expect(screen.getByText("Nominal")).toBeInTheDocument();
    expect(screen.getByText("👥")).toBeInTheDocument();
  });

  test("displays the trend symbol and percentage", () => {
    render(
      <MetricCard
        label="Gates"
        value="5"
        trend="+12%"
        trendDirection="up"
        trendVariant="success"
      />
    );
    const trendEl = screen.getByText("▲ +12%");
    expect(trendEl).toBeInTheDocument();
    expect(trendEl).toHaveClass("kpi-minimal-card__trend--success");
  });

  test("uses down trend symbol and custom variant when configured", () => {
    render(
      <MetricCard
        label="Losses"
        value="1"
        trend="-5%"
        trendDirection="down"
        trendVariant="danger"
      />
    );
    const trendEl = screen.getByText("▼ -5%");
    expect(trendEl).toBeInTheDocument();
    expect(trendEl).toHaveClass("kpi-minimal-card__trend--danger");
  });

  test("uses neutral trend symbol when direction is neutral", () => {
    render(
      <MetricCard
        label="Static"
        value="0"
        trend="0%"
        trendDirection="neutral"
        trendVariant="neutral"
      />
    );
    expect(screen.getByText("■ 0%")).toBeInTheDocument();
  });

  test("applies custom id, className, and variant badge styles", () => {
    const { container } = render(
      <MetricCard
        label="Test"
        value="10"
        id="kpi-test"
        className="special-card"
        variant="warning"
      />
    );
    expect(container.firstChild).toHaveAttribute("id", "kpi-test");
    expect(container.firstChild).toHaveClass("special-card");

    const badge = container.querySelector(".kpi-minimal-card__badge");
    expect(badge).toHaveClass("kpi-minimal-card__badge--warning");
  });
});
