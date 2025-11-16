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
  exif: PhotoExif;
  takenAt: TakenAt;
  cameraMake: CameraMake;
  cameraModel: CameraModel;
  latitude: Latitude;
  longitude: Longitude;
  orientation: Orientation;
  iso: Iso;
  lensMake: LensMake;
  lensModel: LensModel;
  lensSerial: LensSerial;
  focalLength: FocalLength;
  focalLength35mm: FocalLength35mm;
  aperture: Aperture;

  constructor(
    id: PhotoId,
    url: PhotoUrl,
    exif: PhotoExif,
    takenAt: TakenAt,
    cameraMake: CameraMake,
    cameraModel: CameraModel,
    latitude: Latitude,
    longitude: Longitude,
    orientation: Orientation,
    iso: Iso,
    lensMake: LensMake,
    lensModel: LensModel,
    lensSerial: LensSerial,
    focalLength: FocalLength,
    focalLength35mm: FocalLength35mm,
    aperture: Aperture,
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

  updateTakenAt(takenAt: TakenAt): void {
    this.takenAt = takenAt;
  }

  updateCameraMake(cameraMake: CameraMake): void {
    this.cameraMake = cameraMake;
  }

  updateCameraModel(cameraModel: CameraModel): void {
    this.cameraModel = cameraModel;
  }

  updateLatitude(latitude: Latitude): void {
    this.latitude = latitude;
  }

  updateLongitude(longitude: Longitude): void {
    this.longitude = longitude;
  }

  updateOrientation(orientation: Orientation): void {
    this.orientation = orientation;
  }

  updateIso(iso: Iso): void {
    this.iso = iso;
  }

  updateLensMake(lensMake: LensMake): void {
    this.lensMake = lensMake;
  }

  updateLensModel(lensModel: LensModel): void {
    this.lensModel = lensModel;
  }

  updateLensSerial(lensSerial: LensSerial): void {
    this.lensSerial = lensSerial;
  }

  updateFocalLength(focalLength: FocalLength): void {
    this.focalLength = focalLength;
  }

  updateFocalLength35mm(focalLength35mm: FocalLength35mm): void {
    this.focalLength35mm = focalLength35mm;
  }

  updateAperture(aperture: Aperture): void {
    this.aperture = aperture;
  }
}
