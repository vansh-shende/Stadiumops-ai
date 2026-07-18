/**
 * =========================================================
 *  GatesController — Unit Tests
 * =========================================================
 */

const { getAllGates, handleGateAction } = require("./gatesController");
const { dbAll, dbGet, dbRun } = require("../config/database");
const { injectCustomAction } = require("../services/alertEngine");
const logger = require("../utils/logger");

jest.mock("../config/database");
jest.mock("../services/alertEngine");
jest.mock("../utils/logger");

describe("GatesController — getAllGates", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  test("should return 200 and list of gates", async () => {
    const mockGates = [
      { id: 1, gate_name: "Gate A", crowd_density: 30 },
      { id: 2, gate_name: "Gate B", crowd_density: 45 },
    ];
    dbAll.mockResolvedValue(mockGates);

    await getAllGates(req, res);

    expect(dbAll).toHaveBeenCalledWith("SELECT * FROM Gate_Traffic ORDER BY updated_at DESC");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      count: mockGates.length,
      data: mockGates,
    });
  });

  test("should return 500 when database throws an error", async () => {
    dbAll.mockRejectedValue(new Error("DB read error"));

    await getAllGates(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Failed to retrieve gate traffic data.",
    });
  });
});

describe("GatesController — handleGateAction", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        gateName: "Gate A",
        action: "open_auxiliary",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  test("should return 400 if gateName or action is missing", async () => {
    req.body = {};
    await handleGateAction(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Missing gateName or action in request body.",
    });
  });

  test("should return 404 if gate is not found in database", async () => {
    dbGet.mockResolvedValue(null);

    await handleGateAction(req, res);

    expect(dbGet).toHaveBeenCalledWith("SELECT * FROM Gate_Traffic WHERE gate_name = ?", ["Gate A"]);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Gate "Gate A" not found.',
    });
  });

  test("should successfully open auxiliary turnstiles and update values", async () => {
    const gate = { id: 1, gate_name: "Gate A", crowd_density: 80, wait_time: 20 };
    dbGet.mockResolvedValue(gate);
    dbRun.mockResolvedValue({ changes: 1 });

    await handleGateAction(req, res);

    expect(dbRun).toHaveBeenCalledWith(
      "UPDATE Gate_Traffic SET crowd_density = ?, wait_time = ?, updated_at = ? WHERE gate_name = ?",
      [55, 12, expect.any(String), "Gate A"]
    );
    expect(injectCustomAction).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: expect.stringContaining("Auxiliary turnstiles opened"),
      data: {
        gate_name: "Gate A",
        crowd_density: 55,
        wait_time: 12,
        updated_at: expect.any(String),
      },
    });
  });

  test("should successfully deploy stewards and update values", async () => {
    req.body.action = "deploy_stewards";
    const gate = { id: 1, gate_name: "Gate A", crowd_density: 50, wait_time: 10 };
    dbGet.mockResolvedValue(gate);

    await handleGateAction(req, res);

    expect(dbRun).toHaveBeenCalledWith(
      "UPDATE Gate_Traffic SET crowd_density = ?, wait_time = ?, updated_at = ? WHERE gate_name = ?",
      [35, 5, expect.any(String), "Gate A"]
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("should trigger lockdown when not already locked down", async () => {
    req.body.action = "toggle_lockdown";
    const gate = { id: 1, gate_name: "Gate A", crowd_density: 40, wait_time: 5 };
    dbGet.mockResolvedValue(gate);

    await handleGateAction(req, res);

    expect(dbRun).toHaveBeenCalledWith(
      "UPDATE Gate_Traffic SET crowd_density = ?, wait_time = ?, updated_at = ? WHERE gate_name = ?",
      [100, 99, expect.any(String), "Gate A"]
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("should lift lockdown when already locked down", async () => {
    req.body.action = "toggle_lockdown";
    const gate = { id: 1, gate_name: "Gate A", crowd_density: 100, wait_time: 99 };
    dbGet.mockResolvedValue(gate);

    await handleGateAction(req, res);

    expect(dbRun).toHaveBeenCalledWith(
      "UPDATE Gate_Traffic SET crowd_density = ?, wait_time = ?, updated_at = ? WHERE gate_name = ?",
      [35, 6, expect.any(String), "Gate A"]
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("should return 400 for unsupported actions", async () => {
    req.body.action = "unsupported";
    dbGet.mockResolvedValue({ id: 1 });

    await handleGateAction(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Action "unsupported" is not supported.',
    });
  });

  test("should return 500 when database run fails", async () => {
    dbGet.mockResolvedValue({ id: 1 });
    dbRun.mockRejectedValue(new Error("DB error"));

    await handleGateAction(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Failed to execute gate action. Please try again.",
    });
  });
});
