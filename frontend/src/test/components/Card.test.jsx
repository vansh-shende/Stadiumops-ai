/**
 * =========================================================
 *  Card — Unit Tests
 * =========================================================
 */

import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import Card from "components/shared/ui/Card";

describe("Card component", () => {
  test("renders without crashing", () => {
    const { container } = render(<Card>Body Content</Card>);
    expect(container.firstChild).toBeTruthy();
    expect(screen.getByText("Body Content")).toBeInTheDocument();
  });

  test("renders title and icon in header when provided", () => {
    render(
      <Card title="Test Title" icon="🔑">
        Content
      </Card>
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("🔑")).toBeInTheDocument();
  });

  test("renders headerRight when provided", () => {
    render(
      <Card title="Test" headerRight={<button data-testid="right-btn">Right</button>}>
        Content
      </Card>
    );
    expect(screen.getByTestId("right-btn")).toBeInTheDocument();
  });

  test("does not render header markup when title, icon, and headerRight are omitted", () => {
    const { container } = render(<Card>Just Content</Card>);
    const header = container.querySelector(".card__header");
    expect(header).toBeNull();
  });

  test("applies custom className and id", () => {
    const { container } = render(
      <Card className="custom-class" id="custom-id">
        Content
      </Card>
    );
    expect(container.firstChild).toHaveClass("custom-class");
    expect(container.firstChild).toHaveAttribute("id", "custom-id");
  });
});
