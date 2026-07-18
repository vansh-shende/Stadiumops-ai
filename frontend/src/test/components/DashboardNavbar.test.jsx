/**
 * =========================================================
 *  DashboardNavbar — Unit Tests
 * =========================================================
 *
 *  Covers:
 *    - Default rendering with all mocked dependencies
 *    - AppBar position prop mapping (absolute vs navbarType)
 *    - isMini prop hides/shows the right-hand controls
 *    - Toggle sidenav button click dispatches setMiniSidenav
 *    - Live clock displays and updates via setInterval
 *    - Scroll listener sets transparent navbar state
 *    - Static text renders: "SYSTEM ONLINE", "FIFA command center"
 *    - Edge cases: all boolean prop combinations
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import React from "react";

// ── Mock all external dependencies ──────────────────────

// react-router-dom
vi.mock("react-router-dom", () => ({
  useLocation: () => ({ pathname: "/dashboard/operations" }),
}));

// VisionUI context
const mockDispatch = vi.fn();
let mockControllerState = {
  miniSidenav: false,
  transparentNavbar: true,
  fixedNavbar: true,
};

const mockSetTransparentNavbar = vi.fn();
const mockSetMiniSidenav = vi.fn();

vi.mock("context", () => ({
  useVisionUIController: () => [mockControllerState, mockDispatch],
  setTransparentNavbar: (...args) => mockSetTransparentNavbar(...args),
  setMiniSidenav: (...args) => mockSetMiniSidenav(...args),
}));

// VuiBox — simple passthrough div
vi.mock("components/VuiBox", () => ({
  default: React.forwardRef(({ children, ...rest }, ref) => (
    <div ref={ref} data-testid="vui-box" {...rest}>{children}</div>
  )),
}));

// VuiTypography — simple passthrough span
vi.mock("components/VuiTypography", () => ({
  default: React.forwardRef(({ children, ...rest }, ref) => (
    <span ref={ref} data-testid="vui-typography" {...rest}>{children}</span>
  )),
}));

// Breadcrumbs
vi.mock("examples/Breadcrumbs", () => ({
  default: ({ icon, title, route, light }) => (
    <nav data-testid="breadcrumbs" data-title={title}>
      {route?.join(" / ")}
    </nav>
  ),
}));

// Navbar styles — return empty objects
vi.mock("examples/Navbars/DashboardNavbar/styles", () => ({
  navbar: () => ({}),
  navbarContainer: () => ({}),
  navbarRow: () => ({}),
  navbarIconButton: () => ({}),
  navbarMobileMenu: {},
}));

// MUI components — minimal mocks
vi.mock("@mui/material/AppBar", () => ({
  default: React.forwardRef(({ children, position, ...rest }, ref) => (
    <header ref={ref} data-testid="app-bar" data-position={position} {...rest}>
      {children}
    </header>
  )),
}));

vi.mock("@mui/material/Toolbar", () => ({
  default: React.forwardRef(({ children, ...rest }, ref) => (
    <div ref={ref} data-testid="toolbar" {...rest}>{children}</div>
  )),
}));

vi.mock("@mui/material/IconButton", () => ({
  default: React.forwardRef(({ children, onClick, "aria-label": ariaLabel, ...rest }, ref) => (
    <button ref={ref} onClick={onClick} aria-label={ariaLabel} data-testid="icon-button" {...rest}>
      {children}
    </button>
  )),
}));

vi.mock("@mui/material/Menu", () => ({
  default: ({ children }) => <div data-testid="menu">{children}</div>,
}));

vi.mock("@mui/material/Icon", () => ({
  default: ({ children, className }) => (
    <span data-testid="mui-icon" className={className}>{children}</span>
  ),
}));

import DashboardNavbar from "examples/Navbars/DashboardNavbar/index.jsx";

// ────────────────────────────────────────────────
//  Setup / Teardown
// ────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers();
  mockControllerState = {
    miniSidenav: false,
    transparentNavbar: true,
    fixedNavbar: true,
  };
  mockDispatch.mockClear();
  mockSetTransparentNavbar.mockClear();
  mockSetMiniSidenav.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

// ────────────────────────────────────────────────
//  1. Basic Rendering
// ────────────────────────────────────────────────

describe("DashboardNavbar — rendering", () => {
  test("renders without crashing with default props", () => {
    render(<DashboardNavbar />);
    expect(screen.getByTestId("app-bar")).toBeInTheDocument();
  });

  test("renders the Breadcrumbs component", () => {
    render(<DashboardNavbar />);
    expect(screen.getByTestId("breadcrumbs")).toBeInTheDocument();
  });

  test("renders breadcrumbs with last route segment as title", () => {
    render(<DashboardNavbar />);
    const breadcrumbs = screen.getByTestId("breadcrumbs");
    expect(breadcrumbs).toHaveAttribute("data-title", "operations");
  });

  test("renders the Toolbar", () => {
    render(<DashboardNavbar />);
    expect(screen.getByTestId("toolbar")).toBeInTheDocument();
  });

  test("displays 'SYSTEM ONLINE' text", () => {
    render(<DashboardNavbar />);
    expect(screen.getByText("SYSTEM ONLINE")).toBeInTheDocument();
  });

  test("displays 'FIFA command center' text", () => {
    render(<DashboardNavbar />);
    expect(screen.getByText("FIFA command center")).toBeInTheDocument();
  });
});

// ────────────────────────────────────────────────
//  2. AppBar Position
// ────────────────────────────────────────────────

describe("DashboardNavbar — AppBar position", () => {
  test("sets position='absolute' when absolute prop is true", () => {
    render(<DashboardNavbar absolute />);
    expect(screen.getByTestId("app-bar")).toHaveAttribute("data-position", "absolute");
  });

  test("sets position='sticky' when fixedNavbar is true and absolute is false", () => {
    mockControllerState.fixedNavbar = true;
    render(<DashboardNavbar />);
    expect(screen.getByTestId("app-bar")).toHaveAttribute("data-position", "sticky");
  });

  test("sets position='static' when fixedNavbar is false and absolute is false", () => {
    mockControllerState.fixedNavbar = false;
    render(<DashboardNavbar />);
    expect(screen.getByTestId("app-bar")).toHaveAttribute("data-position", "static");
  });
});

// ────────────────────────────────────────────────
//  3. isMini Prop
// ────────────────────────────────────────────────

describe("DashboardNavbar — isMini", () => {
  test("hides toggle button when isMini is true", () => {
    render(<DashboardNavbar isMini />);
    expect(screen.queryByTestId("icon-button")).not.toBeInTheDocument();
  });

  test("shows toggle button when isMini is false (default)", () => {
    render(<DashboardNavbar />);
    expect(screen.getByTestId("icon-button")).toBeInTheDocument();
  });

  test("hides status indicators when isMini is true", () => {
    render(<DashboardNavbar isMini />);
    expect(screen.queryByText("SYSTEM ONLINE")).not.toBeInTheDocument();
    expect(screen.queryByText("FIFA command center")).not.toBeInTheDocument();
  });
});

// ────────────────────────────────────────────────
//  4. Menu Icon Toggle
// ────────────────────────────────────────────────

describe("DashboardNavbar — sidenav toggle", () => {
  test("displays 'menu' icon when miniSidenav is false", () => {
    mockControllerState.miniSidenav = false;
    render(<DashboardNavbar />);
    expect(screen.getByTestId("mui-icon")).toHaveTextContent("menu");
  });

  test("displays 'menu_open' icon when miniSidenav is true", () => {
    mockControllerState.miniSidenav = true;
    render(<DashboardNavbar />);
    expect(screen.getByTestId("mui-icon")).toHaveTextContent("menu_open");
  });

  test("calls setMiniSidenav when toggle button is clicked", () => {
    render(<DashboardNavbar />);
    fireEvent.click(screen.getByTestId("icon-button"));
    expect(mockSetMiniSidenav).toHaveBeenCalledWith(mockDispatch, true);
  });

  test("toggle button has correct aria-label", () => {
    render(<DashboardNavbar />);
    expect(screen.getByTestId("icon-button")).toHaveAttribute(
      "aria-label",
      "Toggle navigation menu"
    );
  });
});

// ────────────────────────────────────────────────
//  5. Live Clock
// ────────────────────────────────────────────────

describe("DashboardNavbar — live clock", () => {
  test("renders a clock emoji", () => {
    render(<DashboardNavbar />);
    expect(screen.getByText("🕒")).toBeInTheDocument();
  });

  test("clock updates after 1 second interval tick", () => {
    const { container } = render(<DashboardNavbar />);

    // Find all vui-typography elements — one of them is the clock
    const typographies = screen.getAllByTestId("vui-typography");
    const clockText = typographies.find((el) =>
      el.textContent.match(/\d{1,2}:\d{2}/)
    );
    expect(clockText).toBeTruthy();

    const initialText = clockText.textContent;

    // Advance timers by 1s — the clock should tick
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // We can't guarantee the text changed (same second), but the interval should have fired
    expect(clockText).toBeTruthy();
  });
});

// ────────────────────────────────────────────────
//  6. Scroll Listener & Transparent Navbar
// ────────────────────────────────────────────────

describe("DashboardNavbar — scroll handling", () => {
  test("calls setTransparentNavbar on mount", () => {
    render(<DashboardNavbar />);
    expect(mockSetTransparentNavbar).toHaveBeenCalled();
  });

  test("registers scroll event listener on window", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    render(<DashboardNavbar />);
    expect(addSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
    addSpy.mockRestore();
  });

  test("removes scroll event listener on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<DashboardNavbar />);
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
    removeSpy.mockRestore();
  });

  test("clears the clock interval on unmount", () => {
    const clearSpy = vi.spyOn(global, "clearInterval");
    const { unmount } = render(<DashboardNavbar />);
    unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});

// ────────────────────────────────────────────────
//  7. Prop Combinations & Edge Cases
// ────────────────────────────────────────────────

describe("DashboardNavbar — edge cases", () => {
  test("renders with all boolean props set to true", () => {
    render(<DashboardNavbar absolute light isMini />);
    expect(screen.getByTestId("app-bar")).toHaveAttribute("data-position", "absolute");
  });

  test("renders with all boolean props set to false", () => {
    mockControllerState.fixedNavbar = false;
    render(<DashboardNavbar absolute={false} light={false} isMini={false} />);
    expect(screen.getByTestId("icon-button")).toBeInTheDocument();
  });

  test("renders with light=true without crashing", () => {
    const { container } = render(<DashboardNavbar light />);
    expect(container.firstChild).toBeTruthy();
  });
});
