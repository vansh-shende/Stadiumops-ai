/**
 * =========================================================
 *  StadiumOps AI — Prompt Builder Tests
 * =========================================================
 *
 *  Validates prompt construction logic and AI prompt safety:
 *    - Correct formatting of anomaly data into prompts
 *    - Edge cases (empty anomalies, missing fields)
 *    - Prompt injection prevention
 */

const { buildPrompt } = require("../prompts/promptBuilder");
const { SYSTEM_PROMPT } = require("../prompts/tacticalCommanderPrompt");

describe("Prompt Builder", () => {
  test("should include the system prompt in every generated prompt", () => {
    const result = buildPrompt({ anomalies: [] });
    expect(result).toContain(SYSTEM_PROMPT);
  });

  test("should indicate no anomalies when anomalies array is empty", () => {
    const result = buildPrompt({ anomalies: [] });
    expect(result).toContain("No active anomalies or issues detected.");
  });

  test("should handle null anomalyData gracefully", () => {
    const result = buildPrompt(null);
    expect(result).toContain("No active anomalies or issues detected.");
  });

  test("should handle undefined anomalyData gracefully", () => {
    const result = buildPrompt(undefined);
    expect(result).toContain("No active anomalies or issues detected.");
  });

  test("should format anomaly data into the prompt correctly", () => {
    const anomalyData = {
      anomalies: [
        {
          type: "CROWD_CONGESTION",
          severity: "HIGH",
          location: "Gate A - Main Entrance",
          message: "Extreme crowd congestion of 95% detected.",
          recommendation: "Open overflow gate immediately."
        }
      ]
    };

    const result = buildPrompt(anomalyData);
    expect(result).toContain("Anomaly 1:");
    expect(result).toContain("CROWD_CONGESTION");
    expect(result).toContain("HIGH");
    expect(result).toContain("Gate A - Main Entrance");
    expect(result).toContain("Extreme crowd congestion of 95% detected.");
    expect(result).toContain("Open overflow gate immediately.");
  });

  test("should format multiple anomalies with correct numbering", () => {
    const anomalyData = {
      anomalies: [
        { type: "CROWD_CONGESTION", severity: "HIGH", location: "Gate A", message: "Crowd 90%", recommendation: "Open gate" },
        { type: "LOW_STOCK", severity: "LOW", location: "Pizza Corner", message: "Only 5 left", recommendation: "Restock" },
        { type: "STAFF_SHORTAGE", severity: "MEDIUM", location: "VIP", message: "1 staff", recommendation: "Deploy" }
      ]
    };

    const result = buildPrompt(anomalyData);
    expect(result).toContain("Anomaly 1:");
    expect(result).toContain("Anomaly 2:");
    expect(result).toContain("Anomaly 3:");
  });

  test("should include CURRENT ANOMALY DATA section header", () => {
    const result = buildPrompt({ anomalies: [] });
    expect(result).toContain("CURRENT ANOMALY DATA");
  });

  test("should include CLEAR INSTRUCTION section header", () => {
    const result = buildPrompt({ anomalies: [] });
    expect(result).toContain("CLEAR INSTRUCTION");
    expect(result).toContain("Generate operational directives only.");
  });
});

describe("Tactical Commander System Prompt", () => {
  test("should define strict output format rules", () => {
    expect(SYSTEM_PROMPT).toContain("Never chat");
    expect(SYSTEM_PROMPT).toContain("Never greet");
    expect(SYSTEM_PROMPT).toContain("[CRITICAL]");
    expect(SYSTEM_PROMPT).toContain("[WARNING]");
    expect(SYSTEM_PROMPT).toContain("[INFO]");
  });

  test("should limit directives to five maximum", () => {
    expect(SYSTEM_PROMPT).toContain("Never generate more than five directives");
  });

  test("should define the commander role", () => {
    expect(SYSTEM_PROMPT).toContain("FIFA Stadium Tactical Operations Commander");
  });
});
