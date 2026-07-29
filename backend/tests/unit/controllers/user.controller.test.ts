const service = { createUser: jest.fn(), loginUser: jest.fn(), googleLogin: jest.fn(), forgotPassword: jest.fn(), resetPassword: jest.fn(), updateUser: jest.fn(), getAllUsers: jest.fn(), getUserById: jest.fn(), adminUpdateUser: jest.fn(), deleteUser: jest.fn(), getSmartRecommendations: jest.fn() };
const chain = { sort: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue([]) };
jest.mock("../../../src/services/user.service", () => ({ UserService: jest.fn(() => service) }));
jest.mock("../../../src/models/user.model", () => ({ UserModel: { countDocuments: jest.fn().mockResolvedValue(1), find: jest.fn(() => chain) } }));
jest.mock("../../../src/models/skill.model", () => ({ SkillModel: { countDocuments: jest.fn().mockResolvedValue(1) } }));
jest.mock("../../../src/models/swap-request.model", () => ({ SwapRequestModel: { countDocuments: jest.fn().mockResolvedValue(1), aggregate: jest.fn().mockResolvedValue([]) } }));
jest.mock("../../../src/models/session.model", () => ({ SessionModel: { countDocuments: jest.fn().mockResolvedValue(1), aggregate: jest.fn().mockResolvedValue([]) } }));
import { UserController } from "../../../src/controllers/user.controller";

const valid = { firstName: "Alex", lastName: "Doe", email: "alex@example.com", username: "alex", phoneNumber: "1234567890", password: "secret1" };
const response = () => { const json = jest.fn(); const status = jest.fn(() => ({ json })); return { status, json, cookie: jest.fn(), clearCookie: jest.fn() } as any; };

describe("UserController", () => {
  const controller = new UserController();
  beforeEach(() => { jest.clearAllMocks(); });
  it("registers and logs in valid accounts", async () => {
    service.createUser.mockResolvedValue({ user: { id: "u1" }, token: "token" }); service.loginUser.mockResolvedValue({ user: { id: "u1" }, token: "token" });
    const registered = response(); await controller.createUser({ body: valid } as any, registered); expect(registered.cookie).toHaveBeenCalled(); expect(registered.status).toHaveBeenCalledWith(201);
    const loggedIn = response(); await controller.loginUser({ body: { email: valid.email, password: valid.password } } as any, loggedIn); expect(loggedIn.cookie).toHaveBeenCalled();
    await controller.createUser({ body: {} } as any, response()); await controller.loginUser({ body: {} } as any, response());
  });
  it("handles Google auth, password flows, current user, and logout", async () => {
    service.googleLogin.mockResolvedValue({ user: {}, token: "token" }); await controller.googleLogin({ body: { credential: "credential" } } as any, response()); await controller.googleLogin({ body: {} } as any, response());
    await controller.forgotPassword({ body: { email: valid.email } } as any, response()); await controller.forgotPassword({ body: {} } as any, response());
    await controller.resetPassword({ body: { token: "token", newPassword: "secret1" } } as any, response()); await controller.resetPassword({ body: {} } as any, response());
    await controller.getCurrentUser({ user: { _id: "u1" } } as any, response()); await controller.getCurrentUser({} as any, response()); const out = response(); await controller.logoutUser({} as any, out); expect(out.clearCookie).toHaveBeenCalled();
  });
  it("updates, lists, administers, and recommends users", async () => {
    service.updateUser.mockResolvedValue({ id: "u1" }); service.getAllUsers.mockResolvedValue([]); service.getUserById.mockResolvedValue({ id: "u1", subscriptionStatus: "pro" }); service.adminUpdateUser.mockResolvedValue({ id: "u1" }); service.getSmartRecommendations.mockResolvedValue([]);
    await controller.updateUser({ user: { _id: "u1" }, body: { skillsOffered: '["JS"]' }, file: { filename: "pic.png" } } as any, response()); await controller.updateUser({ body: {} } as any, response());
    await controller.getAllUsers({} as any, response()); await controller.getDiscoverUsers({} as any, response()); await controller.getUserById({ params: { id: "u1" } } as any, response());
    await controller.adminCreateUser({ body: valid } as any, response()); await controller.adminUpdateUser({ params: { id: "u1" }, body: {}, file: { filename: "pic.png" } } as any, response()); await controller.adminDeleteUser({ params: { id: "u1" } } as any, response()); await controller.getAdminStats({} as any, response());
    await controller.getRecommendations({ user: { _id: "u1" } } as any, response()); await controller.getRecommendations({} as any, response()); service.getUserById.mockResolvedValue({ subscriptionStatus: "free" }); await controller.getRecommendations({ user: { _id: "u1" } } as any, response());
  });

  it("covers controller service failures and malformed profile JSON", async () => {
    const failed = new Error("service failed");
    service.createUser.mockRejectedValueOnce(failed); await controller.createUser({ body: valid } as any, response());
    service.loginUser.mockRejectedValueOnce(failed); await controller.loginUser({ body: { email: valid.email, password: valid.password } } as any, response());
    service.googleLogin.mockRejectedValueOnce(failed); await controller.googleLogin({ body: { credential: "token" } } as any, response());
    service.forgotPassword.mockRejectedValueOnce(failed); await controller.forgotPassword({ body: { email: valid.email } } as any, response());
    service.resetPassword.mockRejectedValueOnce(failed); await controller.resetPassword({ body: { token: "token", newPassword: "secret1" } } as any, response());
    service.updateUser.mockResolvedValueOnce({ id: "u1" }); await controller.updateUser({ user: { id: "u1" }, body: { skillsOffered: "bad", skillsWanted: "also bad" } } as any, response());
    service.getAllUsers.mockRejectedValueOnce(failed); await controller.getAllUsers({} as any, response());
    service.getAllUsers.mockRejectedValueOnce(failed); await controller.getDiscoverUsers({} as any, response());
    service.getUserById.mockRejectedValueOnce(failed); await controller.getUserById({ params: { id: "u1" } } as any, response());
    service.adminUpdateUser.mockRejectedValueOnce(failed); await controller.adminUpdateUser({ params: { id: "u1" }, body: valid } as any, response());
    service.deleteUser.mockRejectedValueOnce(failed); await controller.adminDeleteUser({ params: { id: "u1" } } as any, response());
    service.getUserById.mockResolvedValueOnce({ subscriptionStatus: "pro" }); service.getSmartRecommendations.mockRejectedValueOnce(failed);
    await controller.getRecommendations({ user: { _id: "u1" } } as any, response());
  });
});
