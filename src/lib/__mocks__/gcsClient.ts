import { Readable } from "node:stream";
import { vi } from "vitest";

const mockFile = {
  save: vi.fn().mockResolvedValue(undefined),
  makePublic: vi.fn().mockResolvedValue(undefined),
  exists: vi.fn().mockResolvedValue([true]),
  createReadStream: vi.fn().mockReturnValue(new Readable()),
  delete: vi.fn().mockResolvedValue(undefined),
};
const mockBucket = {
  file: vi.fn(() => mockFile),
};

export const bucket = mockBucket;
