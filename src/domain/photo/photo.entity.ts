// src/domain/photo/photo.entity.ts

import type { PhotoExif } from "../photo/photo-exif/photo-exif";
import type { PhotoId } from "../photo/photo-id/photo-id";
import type { PhotoUrl } from "../photo/photo-url/photo-url";

export class PhotoEntity {
  readonly id: PhotoId;
  url: PhotoUrl;
  exif: PhotoExif;
  takenAt: Date | null;
  cameraMake: string | null;
  cameraModel: string | null;
  latitude: string | null;
  longitude: string | null;
  orientation: number | null;
  iso: number | null;
  lensMake: string | null;
  lensModel: string | null;
  lensSerial: string | null;
  focalLength: string | null;
  focalLength35mm: string | null;
  aperture: string | null;

  constructor(
    id: PhotoId,
    url: PhotoUrl,
    exif: PhotoExif,
    takenAt: Date | null,
    cameraMake: string | null,
    cameraModel: string | null,
    latitude: string | null,
    longitude: string | null,
    orientation: number | null,
    iso: number | null,
    lensMake: string | null,
    lensModel: string | null,
    lensSerial: string | null,
    focalLength: string | null,
    focalLength35mm: string | null,
    aperture: string | null,
  ) {
    this.id = id;
    this.url = url;
    this.exif = exif;
    this.takenAt = takenAt;
    this.cameraMake = cameraMake;
    this.cameraModel = cameraModel;
    this.latitude = latitude;
    this.longitude = longitude;
    this.orientation = orientation;
    this.iso = iso;
    this.lensMake = lensMake;
    this.lensModel = lensModel;
    this.lensSerial = lensSerial;
    this.focalLength = focalLength;
    this.focalLength35mm = focalLength35mm;
    this.aperture = aperture;
  }

  equals(other: PhotoEntity): boolean {
    return this.id.equals(other.id);
  }

  updateUrl(url: PhotoUrl): void {
    this.url = url;
  }

  updateExif(exif: PhotoExif): void {
    this.exif = exif;
  }

  // ... (add other update methods as needed)
}
