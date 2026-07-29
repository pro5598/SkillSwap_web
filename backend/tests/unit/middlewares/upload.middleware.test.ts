const mockDiskStorage = jest.fn((config) => config);
const mockMulter = jest.fn((config) => ({ single: jest.fn(() => "single-handler"), array: jest.fn(() => "array-handler"), fields: jest.fn(() => "fields-handler"), config }));
(mockMulter as any).diskStorage = mockDiskStorage;

jest.mock("multer", () => ({ __esModule: true, default: mockMulter }));
jest.mock("fs", () => ({ existsSync: jest.fn(() => true), mkdirSync: jest.fn() }));
jest.mock("crypto", () => ({ __esModule: true, default: { randomUUID: jest.fn(() => "file-id") } }));

import { uploads, messageUploads } from "../../../src/middlewares/upload.middleware";

describe("upload middleware", () => {
  const configs = () => [(mockMulter as jest.Mock).mock.calls[0][0], (mockMulter as jest.Mock).mock.calls[1][0]];

  it("accepts supported profile images and rejects unsupported types", () => {
    const [profile] = configs();
    const accepted = jest.fn();
    profile.fileFilter({} as any, { mimetype: "image/png" } as any, accepted);
    expect(accepted).toHaveBeenCalledWith(null, true);

    const rejected = jest.fn();
    profile.fileFilter({} as any, { mimetype: "application/pdf" } as any, rejected);
    expect(rejected.mock.calls[0][0]).toMatchObject({ status: 400 });
    expect(profile.limits.fileSize).toBe(5 * 1024 * 1024);
  });

  it("accepts supported message attachments and applies its file-size limit", () => {
    const [, message] = configs();
    const accepted = jest.fn();
    message.fileFilter({} as any, { mimetype: "application/pdf" } as any, accepted);
    expect(accepted).toHaveBeenCalledWith(null, true);

    const rejected = jest.fn();
    message.fileFilter({} as any, { mimetype: "application/x-msdownload" } as any, rejected);
    expect(rejected.mock.calls[0][0]).toMatchObject({ status: 400 });
    expect(message.limits.fileSize).toBe(10 * 1024 * 1024);
  });

  it("exposes the configured multer handlers", () => {
    expect(uploads.single("image")).toBeDefined();
    expect(uploads.array("images", 2)).toBeDefined();
    expect(messageUploads.single("attachment")).toBeDefined();
  });
});
