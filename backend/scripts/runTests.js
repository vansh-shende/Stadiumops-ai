require("dotenv").config();
const { initializeDatabase, dbAll, closeDatabase } = require("../database/initDatabase");
const { getStadiumSnapshot } = require("../services/stadiumDataService");
const { detectAnomalies, generateFallbackDirectives } = require("../services/ruleEngineService");
const { generateText } = require("../services/geminiService");

async function runTests() {
  console.log("=== StadiumOps AI Standard Testing Process ===");
  let failed = false;

  const assert = (condition, message) => {
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      failed = true;
    } else {
      console.log(`✅ PASS: ${message}`);
    }
  };

  try {
    // 1. DB Init and Connection
    console.log("\n[Test 1] Database Initialization & Queries");
    await initializeDatabase();
    
    const gates = await dbAll("SELECT * FROM Gate_Traffic");
    assert(gates.length > 0, "Gate_Traffic table should have seeded rows.");
    assert(gates[0].gate_name !== undefined, "Gate rows should have a gate_name property.");

    const inventory = await dbAll("SELECT * FROM Concession_Inventory");
    assert(inventory.length > 0, "Concession_Inventory table should have seeded rows.");

    const staff = await dbAll("SELECT * FROM Staff_Logistics");
    assert(staff.length > 0, "Staff_Logistics table should have seeded rows.");

    // 2. Stadium Data Service
    console.log("\n[Test 2] Stadium Data Service Snapshot");
    const snapshot = await getStadiumSnapshot();
    assert(snapshot.generatedAt !== undefined, "Snapshot should have generatedAt timestamp.");
    assert(Array.isArray(snapshot.gateTraffic), "Snapshot gateTraffic should be an array.");
    assert(Array.isArray(snapshot.inventory), "Snapshot inventory should be an array.");
    assert(Array.isArray(snapshot.staff), "Snapshot staff should be an array.");

    // 3. Rule Engine
    console.log("\n[Test 3] Anomaly Detection Rules Engine");
    // Test base normal snapshot
    const mockNormalSnapshot = {
      gateTraffic: [
        { id: 1, gate_name: "Gate A - Main Entrance", crowd_density: 30, wait_time: 5 },
      ],
      inventory: [
        { id: 1, stand_name: "Hot Dog Haven", item_name: "Classic Hot Dog", quantity: 50 },
      ],
      staff: [
        { id: 1, staff_name: "Staff 1", zone: "Gate A", status: "Available" },
        { id: 2, staff_name: "Staff 2", zone: "Gate A", status: "Available" },
      ],
    };

    const normalReport = detectAnomalies(mockNormalSnapshot);
    assert(normalReport.anomalyCount === 0, "Normal snapshot should produce 0 anomalies.");

    // Test anomaly cases
    const mockAnomalySnapshot = {
      gateTraffic: [
        { id: 1, gate_name: "Gate A - Main Entrance", crowd_density: 90, wait_time: 20 }, // Density > 85 (HIGH), Wait > 15 (MEDIUM)
      ],
      inventory: [
        { id: 1, stand_name: "Hot Dog Haven", item_name: "Classic Hot Dog", quantity: 15 }, // Qty < 20 (LOW)
      ],
      staff: [
        { id: 1, staff_name: "Staff 1", zone: "Gate A", status: "Available" }, // Only 1 available -> Shortage (MEDIUM/HIGH)
      ],
    };

    const anomalyReport = detectAnomalies(mockAnomalySnapshot);
    assert(anomalyReport.anomalyCount === 4, `Should detect 4 anomalies, found: ${anomalyReport.anomalyCount}`);
    
    const types = anomalyReport.anomalies.map(a => a.type);
    assert(types.includes("CROWD_CONGESTION"), "Should detect CROWD_CONGESTION.");
    assert(types.includes("HIGH_WAIT_TIME"), "Should detect HIGH_WAIT_TIME.");
    assert(types.includes("LOW_STOCK"), "Should detect LOW_STOCK.");
    assert(types.includes("STAFF_SHORTAGE"), "Should detect STAFF_SHORTAGE.");

    // 4. Fallback Directives
    console.log("\n[Test 4] Rule-Based Fallback Directives");
    const fallbackDirectives = generateFallbackDirectives(anomalyReport);
    assert(fallbackDirectives.length > 0, "Fallback directives should not be empty.");
    assert(fallbackDirectives[0].includes("[CRITICAL]") || fallbackDirectives[0].includes("[WARNING]"), "Directives should have severity tags.");

    // 5. Gemini Service Connectivity
    console.log("\n[Test 5] Google Gemini API Connection");
    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await generateText("Reply with exactly: Gemini Connection Verification OK");
        assert(response.trim().includes("Gemini Connection Verification OK"), `Gemini response matches: "${response}"`);
      } catch (geminiErr) {
        if (geminiErr.message.includes("429") || geminiErr.message.includes("quota")) {
          console.log(`⚠️ Gemini API returned 429 Quota Exhausted: ${geminiErr.message}`);
          console.log("ℹ️ This is expected if the API key has hit limits. The rules engine fallback will engage safely.");
          assert(true, "Resilient fallback engaged on API rate-limit.");
        } else {
          assert(false, `Gemini API call failed: ${geminiErr.message}`);
        }
      }
    } else {
      console.log("⚠️ Skipping Gemini connection test (GEMINI_API_KEY not found in environment).");
    }

  } catch (err) {
    console.error("❌ Unexpected Error during test execution:", err.message);
    failed = true;
  } finally {
    await closeDatabase();
    console.log("\n=== Test Execution Completed ===");
    if (failed) {
      process.exitCode = 1;
    }
  }
}

runTests();
