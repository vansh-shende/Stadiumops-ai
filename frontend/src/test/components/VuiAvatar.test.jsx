/**
 * =========================================================
 *  VuiAvatar — Unit Tests
 * =========================================================
 *
 *  Covers:
 *    - Default rendering and prop defaults
 *    - All bgColor, size, and shadow prop variants
 *    - Ref forwarding to the underlying DOM element
 *    - Passing through additional HTML attributes (rest props)
 *    - Edge cases: unknown prop values
 */

import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React, { createRef } from "react";

// Mock VuiAvatarRoot as a simple styled div to avoid full MUI theme
vi.mock("components/VuiAvatar/VuiAvatarRoot", () => ({
  default: React.forwardRef(({ ownerState, ...rest }, ref) => (
    <div
      ref={ref}
      data-testid="avatar-root"
      data-bgcolor={ownerState?.bgColor}
      data-size={ownerState?.size}
      data-shadow={ownerState?.shadow}
      {...rest}
    />
  )),
}));

import VuiAvatar from "components/VuiAvatar/index.jsx";

// ────────────────────────────────────────────────
//  1. Basic Rendering
// ────────────────────────────────────────────────

describe("VuiAvatar — rendering", () => {
  test("renders without crashing with no props", () => {
    render(<VuiAvatar />);
    expect(screen.getByTestId("avatar-root")).toBeInTheDocument();
  });

  test("renders children content inside the avatar", () => {
    render(<VuiAvatar>AB</VuiAvatar>);
    expect(screen.getByText("AB")).toBeInTheDocument();
  });

  test("renders with an image via src prop", () => {
    render(<VuiAvatar src="/avatar.png" alt="User avatar" />);
    const root = screen.getByTestId("avatar-root");
    expect(root).toHaveAttribute("src", "/avatar.png");
    expect(root).toHaveAttribute("alt", "User avatar");
  });
});

// ────────────────────────────────────────────────
//  2. Default Props
// ────────────────────────────────────────────────

describe("VuiAvatar — default props", () => {
  test("passes bgColor='transparent' by default", () => {
    render(<VuiAvatar />);
    expect(screen.getByTestId("avatar-root")).toHaveAttribute("data-bgcolor", "transparent");
  });

  test("passes size='md' by default", () => {
    render(<VuiAvatar />);
    expect(screen.getByTestId("avatar-root")).toHaveAttribute("data-size", "md");
  });

  test("passes shadow='none' by default", () => {
    render(<VuiAvatar />);
    expect(screen.getByTestId("avatar-root")).toHaveAttribute("data-shadow", "none");
  });
});

// ────────────────────────────────────────────────
//  3. bgColor Variants
// ────────────────────────────────────────────────

describe("VuiAvatar — bgColor variants", () => {
  const bgColors = [
    "transparent", "primary", "secondary", "info",
    "success", "warning", "error", "light", "dark",
  ];

  bgColors.forEach((color) => {
    test(`passes bgColor='${color}' to root`, () => {
      render(<VuiAvatar bgColor={color} />);
      expect(screen.getByTestId("avatar-root")).toHaveAttribute("data-bgcolor", color);
    });
  });
});

// ────────────────────────────────────────────────
//  4. Size Variants
// ────────────────────────────────────────────────

describe("VuiAvatar — size variants", () => {
  const sizes = ["xs", "sm", "md", "lg", "xl", "xxl"];

  sizes.forEach((size) => {
    test(`passes size='${size}' to root`, () => {
      render(<VuiAvatar size={size} />);
      expect(screen.getByTestId("avatar-root")).toHaveAttribute("data-size", size);
    });
  });
});

// ────────────────────────────────────────────────
//  5. Shadow Variants
// ────────────────────────────────────────────────

describe("VuiAvatar — shadow variants", () => {
  const shadows = ["none", "xs", "sm", "md", "lg", "xl", "xxl", "inset"];

  shadows.forEach((shadow) => {
    test(`passes shadow='${shadow}' to root`, () => {
      render(<VuiAvatar shadow={shadow} />);
      expect(screen.getByTestId("avatar-root")).toHaveAttribute("data-shadow", shadow);
    });
  });
});

// ────────────────────────────────────────────────
//  6. Ref Forwarding
// ────────────────────────────────────────────────

describe("VuiAvatar — ref forwarding", () => {
  test("forwards ref to the underlying root element", () => {
    const ref = createRef();
    render(<VuiAvatar ref={ref} />);
    expect(ref.current).toBeTruthy();
    expect(ref.current).toHaveAttribute("data-testid", "avatar-root");
  });
});

// ────────────────────────────────────────────────
//  7. Rest Props Pass-through
// ────────────────────────────────────────────────

describe("VuiAvatar — rest props", () => {
  test("passes className to root", () => {
    render(<VuiAvatar className="custom-class" />);
    expect(screen.getByTestId("avatar-root")).toHaveClass("custom-class");
  });

  test("passes data-* attributes to root", () => {
    render(<VuiAvatar data-custom="test-value" />);
    expect(screen.getByTestId("avatar-root")).toHaveAttribute("data-custom", "test-value");
  });

  test("passes aria-label to root", () => {
    render(<VuiAvatar aria-label="User avatar" />);
    expect(screen.getByTestId("avatar-root")).toHaveAttribute("aria-label", "User avatar");
  });

  test("passes onClick handler to root", () => {
    const handleClick = vi.fn();
    render(<VuiAvatar onClick={handleClick} />);
    screen.getByTestId("avatar-root").click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

// ────────────────────────────────────────────────
//  8. Edge Cases
// ────────────────────────────────────────────────

describe("VuiAvatar — edge cases", () => {
  test("renders with no children", () => {
    const { container } = render(<VuiAvatar />);
    expect(container.firstChild).toBeTruthy();
  });

  test("renders with complex children (JSX)", () => {
    render(
      <VuiAvatar>
        <img src="/icon.svg" alt="icon" data-testid="child-img" />
      </VuiAvatar>
    );
    expect(screen.getByTestId("child-img")).toBeInTheDocument();
  });

  test("combines multiple custom props without crashing", () => {
    render(
      <VuiAvatar
        bgColor="primary"
        size="xl"
        shadow="lg"
        className="mega-avatar"
        aria-label="Large avatar"
      />
    );
    const root = screen.getByTestId("avatar-root");
    expect(root).toHaveAttribute("data-bgcolor", "primary");
    expect(root).toHaveAttribute("data-size", "xl");
    expect(root).toHaveAttribute("data-shadow", "lg");
    expect(root).toHaveClass("mega-avatar");
  });
});
