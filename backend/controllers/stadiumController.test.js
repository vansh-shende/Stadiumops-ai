/**
 * =========================================================
 *  StadiumController — Unit Tests
 * =========================================================
 */

const { getSnapshot } = require("./stadiumController");
const { getStadiumSnapshot } = require("../services/stadiumDataService");
const logger = require("../utils/logger");

jest.mock("../services/stadiumDataService");
jest.mock("../utils/logger");

describe("StadiumController — getSnapshot", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  test("should return 200 and snapshot data on success", async () => {
    const mockSnapshot = {
      gates: [{ id: 1, gate_name: "Gate A" }],
      inventory: [{ id: 1, item_name: "Hot Dog" }],
      staff: [{ id: 1, staff_name: "John" }],
    };
    getStadiumSnapshot.mockResolvedValue(mockSnapshot);

    await getSnapshot(req, res);

    expect(getStadiumSnapshot).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockSnapshot,
    });
  });

  test("should return 500 and error message on service rejection", async () => {
    const errorMsg = "Database error";
    getStadiumSnapshot.mockRejectedValue(new Error(errorMsg));

    await getSnapshot(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Failed to retrieve stadium snapshot.",
    });
    expect(logger.error).toHaveBeenCalledWith("API", "Error fetching stadium snapshot:", errorMsg);
  });
});
