/**
 * =========================================================
 *  ProgressBar — Unit Tests
 * =========================================================
 */

import { describe, test, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import ProgressBar from "components/shared/ui/ProgressBar";

describe("ProgressBar component", () => {
  test("renders progress bar with default max=100 and correct percentage width", () => {
    const { container } = render(<ProgressBar value={45} />);
    const bar = container.querySelector("[role='progressbar']");
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute("aria-valuenow", "45");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");

    const fill = container.querySelector(".progress-bar__fill");
    expect(fill).toHaveStyle({ width: "45%" });
  });

  test("clamps values below 0 and above max", () => {
    const { container: lowContainer } = render(<ProgressBar value={-10} />);
    const lowBar = lowContainer.querySelector("[role='progressbar']");
    expect(lowBar).toHaveAttribute("aria-valuenow", "0");

    const { container: highContainer } = render(<ProgressBar value={120} max={100} />);
    const highBar = highContainer.querySelector("[role='progressbar']");
    expect(highBar).toHaveAttribute("aria-valuenow", "100");
  });

  test("supports custom max limit and calculates percentages accordingly", () => {
    const { container } = render(<ProgressBar value={50} max={200} />);
    const bar = container.querySelector("[role='progressbar']");
    expect(bar).toHaveAttribute("aria-valuenow", "25");
  });

  test("applies variant style class to the fill element", () => {
    const { container } = render(<ProgressBar value={50} variant="danger" />);
    const fill = container.querySelector(".progress-bar__fill");
    expect(fill).toHaveClass("progress-bar__fill--danger");
  });

  test("uses barClass override and propagates custom classNames", () => {
    const { container } = render(
      <ProgressBar value={50} barClass="custom-bar" className="extra-class" />
    );
    const outer = container.querySelector("[role='progressbar']");
    expect(outer).toHaveClass("custom-bar");
    expect(outer).toHaveClass("extra-class");

    const fill = container.querySelector(".custom-bar__fill");
    expect(fill).toBeInTheDocument();
  });
});
