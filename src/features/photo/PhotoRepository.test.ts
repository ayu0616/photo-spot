// src/repositories/photoRepository.test.ts

import { eq } from "drizzle-orm";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from "vitest";
import { db } from "../../db";
import { PhotosTable } from "../../db/schema";
import { PhotoEntity } from "./domain/photo.entity"; // Reverted to this
import { Aperture } from "./domain/value-object/aperture";
import { CameraMake } from "./domain/value-object/camera-make";
import { CameraModel } from "./domain/value-object/camera-model";
import { FocalLength } from "./domain/value-object/focal-length";
import { FocalLength35mm } from "./domain/value-object/focal-length-35mm";
import { Iso } from "./domain/value-object/iso";
import { Latitude } from "./domain/value-object/latitude";
import { LensMake } from "./domain/value-object/lens-make";
import { LensModel } from "./domain/value-object/lens-model";
import { LensSerial } from "./domain/value-object/lens-serial";
import { Longitude } from "./domain/value-object/longitude";
import { Orientation } from "./domain/value-object/orientation";
import { PhotoExif } from "./domain/value-object/photo-exif";
import { PhotoId } from "./domain/value-object/photo-id";
import { PhotoUrl } from "./domain/value-object/photo-url";
import { ShutterSpeed } from "./domain/value-object/shutter-speed";
import { TakenAt } from "./domain/value-object/taken-at";
import { PhotoRepository } from "./PhotoRepository"; // Corrected casing

// Drizzle db オブジェクトをモック
vi.mock("../../db", () => {
  const valuesMock = vi.fn().mockReturnThis();
  return {
    db: {
      insert: vi.fn().mockReturnValue({ values: valuesMock }),
      query: {
        PhotosTable: {
          findFirst: vi.fn(),
        },
      },
    },
  };
});

describe("PhotoRepository", () => {
  let photoRepository: PhotoRepository;

  beforeEach(() => {
    photoRepository = new PhotoRepository();
    // モックのクリア
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 各テスト後にモックをリセット
    vi.resetAllMocks();
  });

  it("should save a photo with all EXIF data", async () => {
    // Given
    const mockPhotoEntity = new PhotoEntity(
      PhotoId.create(),
      new PhotoUrl("http://example.com/photo1.jpg"),
      new PhotoExif(JSON.stringify({ some: "exif" })),
      new TakenAt(new Date("2023-01-01T12:00:00Z")),
      new CameraMake("Nikon"),
      new CameraModel("D850"),
      new Latitude("35.6895"),
      new Longitude("139.6917"),
      new Orientation(1),
      new Iso(100),
      new LensMake("Nikon"),
      new LensModel("AF-S NIKKOR 50mm f/1.8G"),
      new LensSerial("12345"),
      new FocalLength("50mm"),
      new FocalLength35mm("50mm"),
      new Aperture("f/1.8"),
      ShutterSpeed.of("1/250"),
    );

    // When
    await photoRepository.save(mockPhotoEntity);

    // Then
    expect(db.insert).toHaveBeenCalledWith(PhotosTable);
    expect(db.insert(PhotosTable).values).toHaveBeenCalledWith({
      id: mockPhotoEntity.id.value,
      url: "http://example.com/photo1.jpg",
      exif: JSON.stringify({ some: "exif" }),
      takenAt: new Date("2023-01-01T12:00:00Z"),
      cameraMake: "Nikon",
      cameraModel: "D850",
      latitude: "35.6895",
      longitude: "139.6917",
      orientation: 1,
      iso: 100,
      lensMake: "Nikon",
      lensModel: "AF-S NIKKOR 50mm f/1.8G",
      lensSerial: "12345",
      focalLength: "50mm",
      focalLength35mm: "50mm",
      aperture: "f/1.8",
      shutterSpeed: "1/250",
    });
  });

  it("should find a photo by id and return PhotoEntity", async () => {
    // Given
    const uuid = crypto.randomUUID();
    const mockPhotoDto = {
      id: uuid,
      url: "http://example.com/photo2.jpg",
      exif: JSON.stringify({ another: "exif" }),
      takenAt: new Date("2023-01-02T13:00:00Z"),
      cameraMake: "Canon",
      cameraModel: "EOS R5",
      latitude: "34.0522",
      longitude: "-118.2437",
      orientation: 1,
      iso: 200,
      lensMake: "Canon",
      lensModel: "RF50mm F1.2 L USM",
      lensSerial: "67890",
      focalLength: "50mm",
      focalLength35mm: "50mm",
      aperture: "f/1.2",
      shutterSpeed: "1/500",
    };
    (db.query.PhotosTable.findFirst as Mock).mockResolvedValue(mockPhotoDto);

    // When
    const foundPhoto = await photoRepository.findById(uuid);

    // Then
    expect(db.query.PhotosTable.findFirst).toHaveBeenCalledWith({
      where: eq(PhotosTable.id, uuid),
    });
    expect(foundPhoto).toBeInstanceOf(PhotoEntity);
    expect(foundPhoto?.id.value).toBe(uuid);
    expect(foundPhoto?.url.value).toBe("http://example.com/photo2.jpg");
    expect(foundPhoto?.aperture?.value).toBe("f/1.2");
    expect(foundPhoto?.shutterSpeed?.value).toBe("1/500");
    // 他のExif情報も検証するが、簡潔のため一部のみ
  });

  it("should return null if photo is not found", async () => {
    // Given
    (db.query.PhotosTable.findFirst as Mock).mockResolvedValue(undefined);

    // When
    const foundPhoto = await photoRepository.findById("non-existent-id");

    // Then
    expect(foundPhoto).toBeNull();
  });
});
