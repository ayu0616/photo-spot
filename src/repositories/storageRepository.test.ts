import fs from "node:fs";
import { Readable } from "node:stream";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { bucket as gcsBucket } from "../lib/gcsClient"; // Import the actual bucket
import { StorageRepository } from "./storageRepository";

describe("StorageRepository", () => {
  let storageRepository: StorageRepository;

  const imgFileName = "test-image.jpg";
  const imgFileBuffer = Buffer.from("test image data");
  const imgContentType = "image/jpeg";

  beforeEach(() => {
    vi.clearAllMocks();

    // Spy on the 'file' method of the actual gcsBucket
    vi.spyOn(gcsBucket, "file");

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
    expect(stream).instanceOf(Readable);
  });

  afterAll(() => {
    fs.unlinkSync(`config/gcp/cloud-storage/storage/test/${imgFileName}`);
  });
});
