// src/domain/photo/photo.entity.ts

import type { Aperture } from "./value-object/aperture";
import type { CameraMake } from "./value-object/camera-make";
import type { CameraModel } from "./value-object/camera-model";
import type { FocalLength } from "./value-object/focal-length";
import type { FocalLength35mm } from "./value-object/focal-length-35mm";
import type { Iso } from "./value-object/iso";
import type { Latitude } from "./value-object/latitude";
import type { LensMake } from "./value-object/lens-make";
import type { LensModel } from "./value-object/lens-model";
import type { LensSerial } from "./value-object/lens-serial";
import type { Longitude } from "./value-object/longitude";
import type { Orientation } from "./value-object/orientation";
import type { PhotoExif } from "./value-object/photo-exif";
import type { PhotoId } from "./value-object/photo-id";
import type { PhotoUrl } from "./value-object/photo-url";
import type { TakenAt } from "./value-object/taken-at";

export class PhotoEntity {
  readonly id: PhotoId;
  url: PhotoUrl;
  exif: PhotoExif | null;
  takenAt: TakenAt | null;
  cameraMake: CameraMake | null;
  cameraModel: CameraModel | null;
  latitude: Latitude | null;
  longitude: Longitude | null;
  orientation: Orientation | null;
  iso: Iso | null;
  lensMake: LensMake | null;
  lensModel: LensModel | null;
  lensSerial: LensSerial | null;
  focalLength: FocalLength | null;
  focalLength35mm: FocalLength35mm | null;
  aperture: Aperture | null;

  constructor(
    id: PhotoId,
    url: PhotoUrl,
    exif: PhotoExif | null,
    takenAt: TakenAt | null,
    cameraMake: CameraMake | null,
    cameraModel: CameraModel | null,
    latitude: Latitude | null,
    longitude: Longitude | null,
    orientation: Orientation | null,
    iso: Iso | null,
    lensMake: LensMake | null,
    lensModel: LensModel | null,
    lensSerial: LensSerial | null,
    focalLength: FocalLength | null,
    focalLength35mm: FocalLength35mm | null,
    aperture: Aperture | null,
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

  updateExif(exif: PhotoExif | null): void {
    this.exif = exif;
  }

  updateTakenAt(takenAt: TakenAt | null): void {
    this.takenAt = takenAt;
  }

  updateCameraMake(cameraMake: CameraMake | null): void {
    this.cameraMake = cameraMake;
  }

  updateCameraModel(cameraModel: CameraModel | null): void {
    this.cameraModel = cameraModel;
  }

  updateLatitude(latitude: Latitude | null): void {
    this.latitude = latitude;
  }

  updateLongitude(longitude: Longitude | null): void {
    this.longitude = longitude;
  }

  updateOrientation(orientation: Orientation | null): void {
    this.orientation = orientation;
  }

  updateIso(iso: Iso | null): void {
    this.iso = iso;
  }

  updateLensMake(lensMake: LensMake | null): void {
    this.lensMake = lensMake;
  }

  updateLensModel(lensModel: LensModel | null): void {
    this.lensModel = lensModel;
  }

  updateLensSerial(lensSerial: LensSerial | null): void {
    this.lensSerial = lensSerial;
  }

  updateFocalLength(focalLength: FocalLength | null): void {
    this.focalLength = focalLength;
  }

  updateFocalLength35mm(focalLength35mm: FocalLength35mm | null): void {
    this.focalLength35mm = focalLength35mm;
  }

  updateAperture(aperture: Aperture | null): void {
    this.aperture = aperture;
  }
}
