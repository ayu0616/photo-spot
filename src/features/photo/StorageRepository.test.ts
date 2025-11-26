import { Readable } from "node:stream";
import type { File } from "@google-cloud/storage";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { bucket as gcsBucket } from "@/lib/gcsClient";
import { StorageRepository } from "./StorageRepository";

describe("StorageRepository", () => {
  let storageRepository: StorageRepository;
  let capturedMockFile: Record<string, Mock>; // Variable to capture the mockFile instance

  const imgFileName = "test-image.jpg";
  const imgFileBuffer = Buffer.from("test image data");
  const imgContentType = "image/jpeg";

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the file object and its methods
    const mockFile = {
      save: vi.fn().mockResolvedValue(undefined),
      makePublic: vi.fn().mockResolvedValue(undefined),
      exists: vi.fn((fileName: string) => {
        if (fileName === imgFileName) {
          return Promise.resolve([true]);
        }
        return Promise.resolve([false]);
      }),
      createReadStream: vi.fn().mockReturnValue(new Readable()),
      delete: vi.fn().mockResolvedValue(undefined), // Mock the delete method
    };

    // Ensure gcsBucket.file is a vi.Mock object and capture the returned mockFile
    vi.spyOn(gcsBucket, "file").mockImplementation((fileName: string) => {
      capturedMockFile = {
        ...mockFile,
        exists: vi.fn().mockResolvedValue([fileName === imgFileName]),
      };
      return capturedMockFile as unknown as File;
    });

    // Mock the makePublic method on the captured mockFile

    storageRepository = new StorageRepository(gcsBucket);
  });

  it("should save a file to GCS", async () => {
    await storageRepository.save(imgFileName, imgFileBuffer, imgContentType);

    expect(gcsBucket.file).toHaveBeenCalledWith(imgFileName);
  });

  it("should check if a file exists and return true", async () => {
    const exists = await storageRepository.exists(imgFileName);

    expect(gcsBucket.file).toHaveBeenCalledWith(imgFileName);
    expect(exists).toBe(true);
  });

  it("should check if a file exists and return false", async () => {
    const fileName = "non-existing-file.txt";

    const exists = await storageRepository.exists(fileName);

    expect(gcsBucket.file).toHaveBeenCalledWith(fileName);
    expect(exists).toBe(false);
  });

  it("should create a readable stream for a file", () => {
    const fileName = "stream-file.txt";

    const stream = storageRepository.createReadStream(fileName);

    expect(gcsBucket.file).toHaveBeenCalledWith(fileName);
    expect(stream).toBeInstanceOf(Readable);
  });

  it("should delete a file from GCS", async () => {
    const fileNameToDelete = "file-to-delete.txt";
    // Use the captured mockFile instance
    await storageRepository.delete(fileNameToDelete);

    expect(gcsBucket.file).toHaveBeenCalledWith(fileNameToDelete);
    expect(capturedMockFile.delete).toHaveBeenCalled();
  });
});
