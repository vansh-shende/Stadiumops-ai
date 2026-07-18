/**
 * =========================================================
 *  Button — Unit Tests
 * =========================================================
 */

import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import Button from "components/shared/ui/Button";

describe("Button component", () => {
  test("renders text content correctly", () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole("button", { name: "Click Me" });
    expect(button).toBeInTheDocument();
  });

  test("triggers onClick callback when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("does not trigger onClick when disabled", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Click Me</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  test("renders variant classes computed via BEM format", () => {
    const { container } = render(<Button variant="danger" size="sm">Action</Button>);
    const button = container.firstChild;
    expect(button).toHaveClass("btn");
    expect(button).toHaveClass("btn--danger");
    expect(button).toHaveClass("btn--sm");
  });

  test("omits base class 'btn' prefix when className includes 'quick-action-btn'", () => {
    const { container } = render(
      <Button className="quick-action-btn custom-button" variant="warning">
        Quick
      </Button>
    );
    const button = container.firstChild;
    expect(button).not.toHaveClass("btn");
    expect(button).toHaveClass("quick-action-btn");
    expect(button).toHaveClass("custom-button");
  });

  test("applies type attribute, aria-label, and styles correctly", () => {
    render(
      <Button type="submit" ariaLabel="Submit Form" style={{ margin: "10px" }}>
        Submit
      </Button>
    );
    const button = screen.getByRole("button", { name: "Submit Form" });
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveStyle({ margin: "10px" });
  });
});
