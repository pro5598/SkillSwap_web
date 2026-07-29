const mockIo = {
  use: jest.fn(),
  on: jest.fn(),
  to: jest.fn(() => ({ emit: jest.fn() })),
};
const mockServer = jest.fn(() => mockIo);
const mockVerify = jest.fn();
const mockFindOne = jest.fn();
const mockSave = jest.fn();
const MockMessageModel: any = jest.fn(() => ({ save: mockSave }));

jest.mock("socket.io", () => ({ Server: mockServer }));
jest.mock("jsonwebtoken", () => ({ __esModule: true, default: { verify: mockVerify } }));
jest.mock("../../src/models/swap-request.model", () => ({ SwapRequestModel: { findOne: mockFindOne } }));
jest.mock("../../src/models/message.model", () => ({ MessageModel: MockMessageModel }));

import { initializeSocket } from "../../src/socket";

const socket = (token?: string, cookie?: string) => {
  const handlers: Record<string, Function> = {};
  return {
    id: "socket-1",
    handshake: { auth: { token } },
    request: { headers: { cookie } },
    data: { user: { id: "u1" } },
    join: jest.fn(),
    broadcast: { emit: jest.fn() },
    emit: jest.fn(),
    on: jest.fn((event, handler) => { handlers[event] = handler; }),
    handlers,
  } as any;
};

describe("socket server", () => {
  let authenticate: Function;
  let connected: Function;

  beforeEach(() => {
    jest.clearAllMocks();
    mockIo.use.mockImplementation((handler) => { authenticate = handler; });
    mockIo.on.mockImplementation((event, handler) => { if (event === "connection") connected = handler; });
    initializeSocket({} as any);
  });

  it("rejects missing and invalid tokens, but accepts a token from a cookie", () => {
    const missing = jest.fn();
    authenticate(socket(), missing);
    expect(missing.mock.calls[0][0]).toEqual(expect.any(Error));

    mockVerify.mockImplementationOnce(() => { throw new Error("bad token"); });
    const invalid = jest.fn();
    authenticate(socket("bad"), invalid);
    expect(invalid.mock.calls[0][0]).toEqual(expect.any(Error));

    mockVerify.mockReturnValueOnce({ id: "u2" });
    const validSocket = socket(undefined, "other=value; skillswap_auth_token=valid-token");
    const accepted = jest.fn();
    authenticate(validSocket, accepted);
    expect(validSocket.data.user).toEqual({ id: "u2" });
    expect(accepted).toHaveBeenCalledWith();
  });

  it("announces presence, blocks messages without an accepted match, and handles disconnects", async () => {
    const client = socket();
    connected(client);
    expect(client.join).toHaveBeenCalledWith("u1");
    expect(client.emit).toHaveBeenCalledWith("online_users", expect.arrayContaining(["u1"]));

    mockFindOne.mockResolvedValueOnce(null);
    const blocked = jest.fn();
    await client.handlers.send_message({ receiverId: "u2", content: "Hello" }, blocked);
    expect(blocked).toHaveBeenCalledWith(expect.objectContaining({ success: false }));

    client.handlers.disconnect();
    expect(client.broadcast.emit).toHaveBeenCalledWith("user_offline", "u1");
  });

  it("saves and delivers messages for accepted matches, including save errors", async () => {
    const client = socket();
    connected(client);
    mockFindOne.mockResolvedValueOnce({ status: "accepted" });
    mockSave.mockResolvedValueOnce(undefined);
    const delivered = jest.fn();
    await client.handlers.send_message({ receiverId: "u2", content: "Hello" }, delivered);
    expect(MockMessageModel).toHaveBeenCalledWith(expect.objectContaining({ senderId: "u1", receiverId: "u2" }));
    expect(mockIo.to).toHaveBeenCalledWith("u2");
    expect(delivered).toHaveBeenCalledWith(expect.objectContaining({ success: true }));

    mockFindOne.mockRejectedValueOnce(new Error("database error"));
    const failed = jest.fn();
    await client.handlers.send_message({ receiverId: "u2", content: "Hello" }, failed);
    expect(failed).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    client.handlers.disconnect();
  });
});
