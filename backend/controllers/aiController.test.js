/**
 * =========================================================
 *  AIController — Unit Tests
 * =========================================================
 */

const { testAI, getAlerts } = require("./aiController");
const { generateText } = require("../services/geminiService");
const { buildPrompt } = require("../prompts/promptBuilder");
const { generateFallbackDirectives } = require("../services/ruleEngineService");
const logger = require("../utils/logger");

jest.mock("../services/geminiService");
jest.mock("../prompts/promptBuilder");
jest.mock("../services/ruleEngineService");
jest.mock("../utils/logger");

describe("AIController — testAI", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  test("should return 200 and Gemini response on success", async () => {
    generateText.mockResolvedValue("Gemini Connected Successfully");

    await testAI(req, res);

    expect(generateText).toHaveBeenCalledWith("Reply with exactly:\nGemini Connected Successfully");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      provider: "Google Gemini",
      response: "Gemini Connected Successfully",
    });
  });

  test("should return 500 when Gemini call throws an error", async () => {
    generateText.mockRejectedValue(new Error("Network Error"));

    await testAI(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "AI connectivity test failed. Please check the API configuration.",
    });
  });
});

describe("AIController — getAlerts", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        anomalies: [
          { type: "LOW_STOCK", severity: "LOW", location: "Concessions", message: "Low stock", recommendation: "Restock" },
        ],
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  test("should return nominal info if body is empty or has no anomalies", async () => {
    req.body = {};
    await getAlerts(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      alerts: ["[INFO] Stadium operations are normal."],
    });

    req.body = { anomalies: [] };
    await getAlerts(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("should return split alerts lines on success", async () => {
    buildPrompt.mockReturnValue("Mock Prompt");
    generateText.mockResolvedValue("Alert 1\nAlert 2  \n\nAlert 3");

    await getAlerts(req, res);

    expect(buildPrompt).toHaveBeenCalledWith(req.body);
    expect(generateText).toHaveBeenCalledWith("Mock Prompt");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      alerts: ["Alert 1", "Alert 2", "Alert 3"],
    });
  });

  test("should fallback to rule-based directives on Gemini API failure", async () => {
    buildPrompt.mockReturnValue("Mock Prompt");
    generateText.mockRejectedValue(new Error("Quota Limit"));
    generateFallbackDirectives.mockReturnValue(["Fallback Alert 1"]);

    await getAlerts(req, res);

    expect(logger.warn).toHaveBeenCalled();
    expect(generateFallbackDirectives).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      alerts: ["Fallback Alert 1"],
    });
  });

  test("should return 500 on total execution failure", async () => {
    buildPrompt.mockImplementation(() => {
      throw new Error("Prompt Error");
    });

    await getAlerts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Failed to generate tactical directives.",
    });
  });
});
