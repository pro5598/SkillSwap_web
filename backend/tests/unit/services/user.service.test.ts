const repository = {
  getUserByEmail: jest.fn(), getUserByUsername: jest.fn(), createUser: jest.fn(),
  getUserByGoogleId: jest.fn(), update: jest.fn(), getUserByResetToken: jest.fn(),
  getUserById: jest.fn(), getAll: jest.fn(), delete: jest.fn(),
};
const mockVerifyIdToken = jest.fn();

jest.mock("../../../src/repositories/user.repository", () => ({ UserMongoRepository: jest.fn(() => repository) }));
jest.mock("bcryptjs", () => ({ __esModule: true, default: { hash: jest.fn(), compare: jest.fn() } }));
jest.mock("jsonwebtoken", () => ({ __esModule: true, default: { sign: jest.fn(() => "token") } }));
jest.mock("nodemailer", () => ({ __esModule: true, default: { createTransport: jest.fn() } }));
jest.mock("google-auth-library", () => ({ OAuth2Client: jest.fn(() => ({ verifyIdToken: mockVerifyIdToken })) }));
jest.mock("../../../src/configs/constant", () => ({ JWT_SECRET: "test-secret", GOOGLE_CLIENT_ID: "client", SMTP_HOST: "host", SMTP_PORT: 25, SMTP_USER: "user", SMTP_PASS: "pass", FRONTEND_URL: "http://localhost", GROQ_API_KEY: "" }));

import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";
import { UserService } from "../../../src/services/user.service";

const user = { _id: "user-1", email: "a@example.com", username: "alex", password: "hashed", role: "user", firstName: "Alex", toObject() { return { ...this }; } };

describe("UserService", () => {
  const service = new UserService();
  beforeEach(() => { jest.clearAllMocks(); });

  it("creates a user, hashes the password, and hides it from the result", async () => {
    repository.getUserByEmail.mockResolvedValue(null); repository.getUserByUsername.mockResolvedValue(null);
    (bcryptjs.hash as jest.Mock).mockResolvedValue("hashed"); repository.createUser.mockResolvedValue(user);
    const result = await service.createUser({ email: user.email, username: user.username, password: "secret", firstName: "Alex", lastName: "A" } as any);
    expect(result).toEqual(expect.objectContaining({ token: "token", user: expect.not.objectContaining({ password: expect.anything() }) }));
  });

  it("rejects duplicate email and username during registration", async () => {
    repository.getUserByEmail.mockResolvedValue(user);
    await expect(service.createUser({ email: user.email } as any)).rejects.toMatchObject({ status: 400 });
    repository.getUserByEmail.mockResolvedValue(null); repository.getUserByUsername.mockResolvedValue(user);
    await expect(service.createUser({ email: "b@example.com", username: user.username } as any)).rejects.toMatchObject({ status: 400 });
  });

  it("logs in only with a valid password", async () => {
    repository.getUserByEmail.mockResolvedValue(user); (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
    await expect(service.loginUser({ email: user.email, password: "secret" } as any)).resolves.toEqual(expect.objectContaining({ token: "token" }));
    repository.getUserByEmail.mockResolvedValue(null);
    await expect(service.loginUser({ email: user.email, password: "secret" } as any)).rejects.toMatchObject({ status: 400 });
    repository.getUserByEmail.mockResolvedValue({ ...user, password: undefined });
    await expect(service.loginUser({ email: user.email, password: "secret" } as any)).rejects.toMatchObject({ status: 400 });
    repository.getUserByEmail.mockResolvedValue(user); (bcryptjs.compare as jest.Mock).mockResolvedValue(false);
    await expect(service.loginUser({ email: user.email, password: "bad" } as any)).rejects.toMatchObject({ status: 400 });
  });

  it("handles invalid, linked, and new Google accounts", async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error("invalid credential"));
    await expect(service.googleLogin("bad-token")).rejects.toMatchObject({ status: 400 });

    mockVerifyIdToken.mockResolvedValueOnce({ getPayload: () => undefined });
    await expect(service.googleLogin("missing-payload")).rejects.toMatchObject({ status: 400 });

    const googleUser = { ...user, googleId: "google-1" };
    mockVerifyIdToken.mockResolvedValueOnce({
      getPayload: () => ({ sub: "google-1", email: user.email, given_name: "Alex", family_name: "Doe" }),
    });
    repository.getUserByGoogleId.mockResolvedValueOnce(googleUser);
    await expect(service.googleLogin("existing-google")).resolves.toEqual(expect.objectContaining({ token: "token" }));

    const existingEmailUser = { ...user };
    mockVerifyIdToken.mockResolvedValueOnce({
      getPayload: () => ({ sub: "google-2", email: user.email, given_name: "Alex", family_name: "Doe" }),
    });
    repository.getUserByGoogleId.mockResolvedValueOnce(null);
    repository.getUserByEmail.mockResolvedValueOnce(existingEmailUser);
    await service.googleLogin("linked-email");
    expect(repository.update).toHaveBeenCalledWith(user._id, { googleId: "google-2" });

    mockVerifyIdToken.mockResolvedValueOnce({
      getPayload: () => ({ sub: "google-3", email: "new.user@example.com", picture: "avatar.png" }),
    });
    repository.getUserByGoogleId.mockResolvedValueOnce(null);
    repository.getUserByEmail.mockResolvedValueOnce(null);
    repository.getUserByUsername.mockResolvedValueOnce(user);
    repository.createUser.mockResolvedValueOnce({ ...user, email: "new.user@example.com", username: "new_user_extra" });
    await service.googleLogin("new-account");
    expect(repository.createUser).toHaveBeenCalledWith(expect.objectContaining({ username: expect.stringMatching(/^new_user_/) }));
  });

  it("sends reset mail only for an existing account and resets a valid token", async () => {
    const sendMail = jest.fn().mockResolvedValue(undefined);
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });
    repository.getUserByEmail.mockResolvedValue(null);
    await expect(service.forgotPassword(user.email)).resolves.toBeUndefined(); expect(sendMail).not.toHaveBeenCalled();
    repository.getUserByEmail.mockResolvedValue(user); await service.forgotPassword(user.email); expect(repository.update).toHaveBeenCalled(); expect(sendMail).toHaveBeenCalled();
    repository.getUserByResetToken.mockResolvedValue(null); await expect(service.resetPassword("token", "new")).rejects.toMatchObject({ status: 400 });
    repository.getUserByResetToken.mockResolvedValue(user); (bcryptjs.hash as jest.Mock).mockResolvedValue("new-hash"); await service.resetPassword("token", "new"); expect(repository.update).toHaveBeenCalled();
  });

  it("updates users safely and validates password changes", async () => {
    repository.getUserById.mockResolvedValue(null); await expect(service.updateUser("missing", {} as any)).rejects.toMatchObject({ status: 404 });
    repository.getUserById.mockResolvedValue(user); repository.getUserByEmail.mockResolvedValue(user);
    await expect(service.updateUser(user._id, { email: "new@example.com" } as any)).rejects.toMatchObject({ status: 400 });
    repository.getUserByEmail.mockResolvedValue(null); repository.update.mockResolvedValue(user);
    const result = await service.updateUser(user._id, { password: "do-not-save" } as any); expect(result).not.toHaveProperty("password");
    await expect(service.updateUser(user._id, { newPassword: "new" } as any)).rejects.toMatchObject({ status: 400 });
    (bcryptjs.compare as jest.Mock).mockResolvedValue(true); (bcryptjs.hash as jest.Mock).mockResolvedValue("new-hash");
    await service.updateUser(user._id, { currentPassword: "secret", newPassword: "new" } as any); expect(repository.update).toHaveBeenCalled();
  });

  it("rejects conflicting user updates and handles unsuccessful writes", async () => {
    repository.getUserById.mockResolvedValue(user);
    repository.getUserByUsername.mockResolvedValue(user);
    await expect(service.updateUser(user._id, { username: "other" } as any)).rejects.toMatchObject({ status: 400 });

    repository.getUserByUsername.mockResolvedValue(null);
    (bcryptjs.compare as jest.Mock).mockResolvedValue(false);
    await expect(service.updateUser(user._id, { currentPassword: "secret", newPassword: "new" } as any)).rejects.toMatchObject({ status: 400 });

    repository.getUserById.mockResolvedValue({ ...user, password: undefined });
    await expect(service.updateUser(user._id, { currentPassword: "secret", newPassword: "new" } as any)).rejects.toMatchObject({ status: 400 });

    repository.getUserById.mockResolvedValue(user);
    (bcryptjs.compare as jest.Mock).mockResolvedValue(false);
    await expect(service.updateUser(user._id, { currentPassword: "wrong", newPassword: "new" } as any)).rejects.toMatchObject({ status: 400 });

    repository.update.mockResolvedValue(null);
    await expect(service.updateUser(user._id, { firstName: "New" } as any)).resolves.toBeNull();
  });

  it("lets administrators reset passwords while validating identity conflicts", async () => {
    repository.getUserById.mockResolvedValue(null);
    await expect(service.adminUpdateUser("missing", {} as any)).rejects.toMatchObject({ status: 404 });

    repository.getUserById.mockResolvedValue(user);
    repository.getUserByEmail.mockResolvedValue(user);
    await expect(service.adminUpdateUser(user._id, { email: "new@example.com" } as any)).rejects.toMatchObject({ status: 400 });

    repository.getUserByEmail.mockResolvedValue(null);
    repository.getUserByUsername.mockResolvedValue(user);
    await expect(service.adminUpdateUser(user._id, { username: "new-user" } as any)).rejects.toMatchObject({ status: 400 });

    repository.getUserByUsername.mockResolvedValue(null);
    (bcryptjs.hash as jest.Mock).mockResolvedValue("admin-hash");
    repository.update.mockResolvedValue(user);
    await expect(service.adminUpdateUser(user._id, { newPassword: "new-password" } as any)).resolves.not.toHaveProperty("password");
    expect(repository.update).toHaveBeenCalledWith(user._id, expect.objectContaining({ password: "admin-hash" }));
  });

  it("returns safe users and supports deletion", async () => {
    repository.getAll.mockResolvedValue([user]); await expect(service.getAllUsers()).resolves.toEqual([expect.not.objectContaining({ password: expect.anything() })]);
    repository.getUserById.mockResolvedValue(user); await expect(service.getUserById(user._id)).resolves.not.toHaveProperty("password"); await expect(service.deleteUser(user._id)).resolves.toBe(true);
    repository.getUserById.mockResolvedValue(null); await expect(service.deleteUser("missing")).rejects.toMatchObject({ status: 404 });
  });

  it("handles missing users and empty recommendation pools", async () => {
    repository.getUserById.mockResolvedValueOnce(null);
    await expect(service.getUserById("missing")).rejects.toMatchObject({ status: 404 });
    repository.getUserById.mockResolvedValueOnce(null);
    await expect(service.getSmartRecommendations("missing")).rejects.toMatchObject({ status: 404 });
    repository.getUserById.mockResolvedValueOnce({ ...user, skillsOffered: ["Node"], skillsWanted: ["Design"] });
    repository.getAll.mockResolvedValueOnce([]);
    await expect(service.getSmartRecommendations(user._id)).resolves.toEqual([]);
  });

  it("uses basic recommendation matching when AI recommendations are unavailable", async () => {
    const current = { ...user, skillsOffered: ["Node"], skillsWanted: ["Design"] };
    const matching = { ...user, _id: "match", password: "secret", skillsOffered: ["Design"], skillsWanted: ["Node"] };
    const unrelated = { ...user, _id: "other", skillsOffered: ["Music"], skillsWanted: ["Cooking"] };
    repository.getUserById.mockResolvedValueOnce(current);
    repository.getAll.mockResolvedValueOnce([matching, unrelated]);
    const matches = await service.getSmartRecommendations(user._id);
    expect(matches).toEqual([expect.objectContaining({ _id: "match" })]);
    expect(matches[0]).not.toHaveProperty("password");
  });

  it("handles reverse matches and profiles without skills in the recommendation fallback", async () => {
    const current = { ...user, skillsOffered: ["Node"], skillsWanted: ["Design"] };
    const reverse = { ...user, _id: "reverse", skillsOffered: ["Design"], skillsWanted: [] };
    const empty = { ...user, _id: "empty", skillsOffered: undefined, skillsWanted: undefined };
    repository.getUserById.mockResolvedValueOnce(current);
    repository.getAll.mockResolvedValueOnce([reverse, empty]);
    await expect(service.getSmartRecommendations(user._id)).resolves.toEqual([expect.objectContaining({ _id: "reverse" })]);
  });
});
