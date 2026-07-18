/**
 * =========================================================
 *  Badge — Unit Tests
 * =========================================================
 */

import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import Badge from "components/shared/ui/Badge";

describe("Badge component", () => {
  test("renders correctly with defaults", () => {
    render(<Badge>Normal</Badge>);
    const badge = screen.getByText("Normal");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("badge");
    expect(badge).toHaveClass("badge--info");
  });

  test("applies variant classes correctly", () => {
    const { container } = render(<Badge variant="success">Active</Badge>);
    expect(container.firstChild).toHaveClass("badge--success");
  });

  test("renders the badge dot when dot=true", () => {
    const { container } = render(<Badge dot variant="danger">Critical</Badge>);
    const dot = container.querySelector(".badge-dot");
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveClass("badge-dot--danger");
  });

  test("applies custom classNames", () => {
    const { container } = render(<Badge className="custom-badge">Tag</Badge>);
    expect(container.firstChild).toHaveClass("custom-badge");
  });
});
