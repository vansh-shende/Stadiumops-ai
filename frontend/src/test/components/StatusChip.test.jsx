/**
 * =========================================================
 *  StatusChip — Unit Tests
 * =========================================================
 */

import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import StatusChip from "components/shared/ui/StatusChip";

describe("StatusChip component", () => {
  test("renders correctly with defaults", () => {
    render(<StatusChip>Active</StatusChip>);
    const chip = screen.getByText("Active");
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveClass("status-pill");
    expect(chip).toHaveClass("status-pill--info");
  });

  test("applies variant classes correctly", () => {
    const { container } = render(<StatusChip variant="success">Online</StatusChip>);
    expect(container.firstChild).toHaveClass("status-pill--success");
  });

  test("applies custom classNames and inline styles", () => {
    const { container } = render(
      <StatusChip className="custom-class" style={{ color: "red" }}>
        Test
      </StatusChip>
    );
    expect(container.firstChild).toHaveClass("custom-class");
    expect(container.firstChild).toHaveStyle({ color: "rgb(255, 0, 0)" });
  });
});
