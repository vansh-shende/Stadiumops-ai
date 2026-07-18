/**
 * =========================================================
 *  CameraCard — Unit Tests
 * =========================================================
 */

import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import CameraCard from "components/shared/ui/CameraCard";

describe("CameraCard component", () => {
  test("renders text attributes correctly", () => {
    render(
      <CameraCard
        camId="CAM-01"
        label="Main Gate Entry"
        imageSrc="http://example.com/cam.jpg"
        status="success"
        timestamp="10:00:00 AM"
      />
    );

    expect(screen.getByText("CAM-01")).toBeInTheDocument();
    expect(screen.getByText("Main Gate Entry")).toBeInTheDocument();
    expect(screen.getByText("10:00:00 AM")).toBeInTheDocument();
    expect(screen.getByText("ONLINE")).toBeInTheDocument();

    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "http://example.com/cam.jpg");
    expect(img).toHaveAttribute("alt", "CCTV Feed CAM-01");
  });

  test("displays offline text override when custom statusLabel is passed", () => {
    render(
      <CameraCard
        camId="CAM-02"
        label="Side Gate"
        imageSrc="http://example.com/cam2.jpg"
        status="danger"
        statusLabel="CRITICAL ANOMALY"
        timestamp="10:01:00 AM"
      />
    );
    expect(screen.getByText("CRITICAL ANOMALY")).toBeInTheDocument();
    expect(screen.queryByText("ANOMALY")).toBeNull();
  });

  test("displays overlay badge when activeOverlay=true", () => {
    render(
      <CameraCard
        camId="CAM-03"
        label="Gate 3"
        imageSrc="http://example.com/cam3.jpg"
        status="warning"
        timestamp="10:02:00 AM"
        activeOverlay
        overlayLabel="INTRUSION DETECTION"
      />
    );
    expect(screen.getByText("INTRUSION DETECTION")).toBeInTheDocument();
  });

  test("hides recording indicator when rec=false", () => {
    const { container } = render(
      <CameraCard
        camId="CAM-04"
        label="Gate 4"
        imageSrc="http://example.com/cam4.jpg"
        status="success"
        timestamp="10:03:00 AM"
        rec={false}
      />
    );
    const recDot = container.querySelector(".camera-feed__rec-dot");
    expect(recDot).toBeNull();
  });
});
