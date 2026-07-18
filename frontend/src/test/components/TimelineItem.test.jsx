/**
 * =========================================================
 *  TimelineItem — Unit Tests
 * =========================================================
 *
 *  Covers:
 *    - Default rendering with all required props
 *    - Severity class application (critical, warning, info)
 *    - Conditional rendering of the recommendedAction field
 *    - Correct timestamp formatting
 *    - Edge cases: missing/empty/undefined props
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import TimelineItem from "components/shared/ui/TimelineItem";

// ────────────────────────────────────────────────
//  Helpers
// ────────────────────────────────────────────────

/** Standard props that satisfy all required fields. */
const baseProps = {
  timestamp: "2026-07-18T14:30:00Z",
  category: "Gate Traffic",
  message: "High congestion detected at Gate A",
  location: "Gate A - Main Entrance",
  recommendedAction: "Redirect traffic to Gate B",
  severity: "warning",
};

// ────────────────────────────────────────────────
//  1. Basic Rendering
// ────────────────────────────────────────────────

describe("TimelineItem — rendering", () => {
  test("renders without crashing with all props", () => {
    const { container } = render(<TimelineItem {...baseProps} />);
    expect(container.firstChild).toBeTruthy();
  });

  test("displays the category text", () => {
    render(<TimelineItem {...baseProps} />);
    expect(screen.getByText("Gate Traffic")).toBeInTheDocument();
  });

  test("displays the message text", () => {
    render(<TimelineItem {...baseProps} />);
    expect(screen.getByText("High congestion detected at Gate A")).toBeInTheDocument();
  });

  test("displays the location text", () => {
    render(<TimelineItem {...baseProps} />);
    expect(screen.getByText("Gate A - Main Entrance")).toBeInTheDocument();
  });

  test("displays the recommendedAction text when provided", () => {
    render(<TimelineItem {...baseProps} />);
    expect(screen.getByText("Redirect traffic to Gate B")).toBeInTheDocument();
  });

  test("renders the timeline badge dot", () => {
    const { container } = render(<TimelineItem {...baseProps} />);
    const dot = container.querySelector(".timeline-badge-dot");
    expect(dot).toBeInTheDocument();
  });

  test("formats the timestamp using toLocaleTimeString", () => {
    const { container } = render(<TimelineItem {...baseProps} />);
    const timeEl = container.querySelector(".timeline-time");
    expect(timeEl).toBeInTheDocument();
    // The exact format depends on locale, but it should be non-empty
    expect(timeEl.textContent.length).toBeGreaterThan(0);
  });
});

// ────────────────────────────────────────────────
//  2. Severity Variants
// ────────────────────────────────────────────────

describe("TimelineItem — severity classes", () => {
  test("applies 'timeline-item--warning' class for warning severity", () => {
    const { container } = render(<TimelineItem {...baseProps} severity="warning" />);
    expect(container.firstChild).toHaveClass("timeline-item--warning");
  });

  test("applies 'timeline-item--critical' class for critical severity", () => {
    const { container } = render(<TimelineItem {...baseProps} severity="critical" />);
    expect(container.firstChild).toHaveClass("timeline-item--critical");
  });

  test("applies 'timeline-item--info' class for info severity", () => {
    const { container } = render(<TimelineItem {...baseProps} severity="info" />);
    expect(container.firstChild).toHaveClass("timeline-item--info");
  });

  test("defaults to 'timeline-item--info' when severity is omitted", () => {
    const { severity, ...propsWithoutSeverity } = baseProps;
    const { container } = render(<TimelineItem {...propsWithoutSeverity} />);
    expect(container.firstChild).toHaveClass("timeline-item--info");
  });
});

// ────────────────────────────────────────────────
//  3. Conditional Rendering
// ────────────────────────────────────────────────

describe("TimelineItem — conditional rendering", () => {
  test("does NOT render action label when recommendedAction is undefined", () => {
    const { recommendedAction, ...propsWithoutAction } = baseProps;
    render(<TimelineItem {...propsWithoutAction} />);
    expect(screen.queryByText("Action:")).not.toBeInTheDocument();
  });

  test("does NOT render action label when recommendedAction is empty string", () => {
    render(<TimelineItem {...baseProps} recommendedAction="" />);
    expect(screen.queryByText("Action:")).not.toBeInTheDocument();
  });

  test("does NOT render action label when recommendedAction is null", () => {
    render(<TimelineItem {...baseProps} recommendedAction={null} />);
    expect(screen.queryByText("Action:")).not.toBeInTheDocument();
  });

  test("always renders Location label regardless of props", () => {
    render(<TimelineItem {...baseProps} />);
    expect(screen.getByText("Location:")).toBeInTheDocument();
  });
});

// ────────────────────────────────────────────────
//  4. Edge Cases
// ────────────────────────────────────────────────

describe("TimelineItem — edge cases", () => {
  test("renders with an empty message", () => {
    const { container } = render(<TimelineItem {...baseProps} message="" />);
    expect(container.firstChild).toBeTruthy();
  });

  test("renders with a very long message without crashing", () => {
    const longMessage = "A".repeat(5000);
    const { container } = render(<TimelineItem {...baseProps} message={longMessage} />);
    const messageEl = container.querySelector(".timeline-message");
    expect(messageEl.textContent).toBe(longMessage);
  });

  test("renders with special characters in all text fields", () => {
    render(
      <TimelineItem
        timestamp="2026-07-18T14:30:00Z"
        category="<script>alert('xss')</script>"
        message='He said "hello" & goodbye'
        location="Gate A > Main & Sub"
        recommendedAction="Redirect → Gate B"
        severity="info"
      />
    );
    expect(screen.getByText("<script>alert('xss')</script>")).toBeInTheDocument();
    expect(screen.getByText('He said "hello" & goodbye')).toBeInTheDocument();
  });

  test("handles an invalid timestamp string gracefully", () => {
    // new Date("invalid").toLocaleTimeString() returns "Invalid Date" on most engines
    const { container } = render(<TimelineItem {...baseProps} timestamp="not-a-date" />);
    expect(container.firstChild).toBeTruthy();
  });

  test("renders correctly when only required props are supplied", () => {
    const { container } = render(
      <TimelineItem
        timestamp="2026-01-01T00:00:00Z"
        category="Test"
        message="Test message"
        location="Zone A"
      />
    );
    expect(container.querySelector(".timeline-item--info")).toBeInTheDocument();
  });
});
