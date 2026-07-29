import { ApiResponseHelper } from "../../../src/utils/apihelper.util";
const response = () => { const json = jest.fn((body) => body); const status = jest.fn(() => ({ json })); return { status, json } as any; };
describe("ApiResponseHelper", () => {
  it("supports default and custom success responses", () => {
    const defaults = response(); ApiResponseHelper.success(defaults); expect(defaults.status).toHaveBeenCalledWith(200);
    const custom = response(); ApiResponseHelper.success(custom, { id: "1" }, "Created", 201); expect(custom.status).toHaveBeenCalledWith(201);
  });
  it("supports default and custom error responses", () => {
    const defaults = response(); ApiResponseHelper.error(defaults); expect(defaults.status).toHaveBeenCalledWith(500);
    const custom = response(); ApiResponseHelper.error(custom, "Missing", 404); expect(custom.status).toHaveBeenCalledWith(404);
  });
});
