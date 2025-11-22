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
import type { ShutterSpeed } from "./value-object/shutter-speed";
import type { TakenAt } from "./value-object/taken-at";

export class PhotoEntity {
  private readonly _id: PhotoId;
  private _url: PhotoUrl;
  private _exif: PhotoExif | null;
  private _takenAt: TakenAt | null;
  private _cameraMake: CameraMake | null;
  private _cameraModel: CameraModel | null;
  private _latitude: Latitude | null;
  private _longitude: Longitude | null;
  private _orientation: Orientation | null;
  private _iso: Iso | null;
  private _lensMake: LensMake | null;
  private _lensModel: LensModel | null;
  private _lensSerial: LensSerial | null;
  private _focalLength: FocalLength | null;
  private _focalLength35mm: FocalLength35mm | null;
  private _aperture: Aperture | null;
  private _shutterSpeed: ShutterSpeed | null;

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
    shutterSpeed: ShutterSpeed | null,
  ) {
    this._id = id;
    this._url = url;
    this._exif = exif;
    this._takenAt = takenAt;
    this._cameraMake = cameraMake;
    this._cameraModel = cameraModel;
    this._latitude = latitude;
    this._longitude = longitude;
    this._orientation = orientation;
    this._iso = iso;
    this._lensMake = lensMake;
    this._lensModel = lensModel;
    this._lensSerial = lensSerial;
    this._focalLength = focalLength;
    this._focalLength35mm = focalLength35mm;
    this._aperture = aperture;
    this._shutterSpeed = shutterSpeed;
  }

  get id(): PhotoId {
    return this._id;
  }

  get url(): PhotoUrl {
    return this._url;
  }

  get exif(): PhotoExif | null {
    return this._exif;
  }

  get takenAt(): TakenAt | null {
    return this._takenAt;
  }

  get cameraMake(): CameraMake | null {
    return this._cameraMake;
  }

  get cameraModel(): CameraModel | null {
    return this._cameraModel;
  }

  get latitude(): Latitude | null {
    return this._latitude;
  }

  get longitude(): Longitude | null {
    return this._longitude;
  }

  get orientation(): Orientation | null {
    return this._orientation;
  }

  get iso(): Iso | null {
    return this._iso;
  }

  get lensMake(): LensMake | null {
    return this._lensMake;
  }

  get lensModel(): LensModel | null {
    return this._lensModel;
  }

  get lensSerial(): LensSerial | null {
    return this._lensSerial;
  }

  get focalLength(): FocalLength | null {
    return this._focalLength;
  }

  get focalLength35mm(): FocalLength35mm | null {
    return this._focalLength35mm;
  }

  get aperture(): Aperture | null {
    return this._aperture;
  }

  get shutterSpeed(): ShutterSpeed | null {
    return this._shutterSpeed;
  }

  equals(other: PhotoEntity): boolean {
    return this._id.equals(other.id);
  }

  updateUrl(url: PhotoUrl): void {
    this._url = url;
  }

  updateExif(exif: PhotoExif | null): void {
    this._exif = exif;
  }

  updateTakenAt(takenAt: TakenAt | null): void {
    this._takenAt = takenAt;
  }

  updateCameraMake(cameraMake: CameraMake | null): void {
    this._cameraMake = cameraMake;
  }

  updateCameraModel(cameraModel: CameraModel | null): void {
    this._cameraModel = cameraModel;
  }

  updateLatitude(latitude: Latitude | null): void {
    this._latitude = latitude;
  }

  updateLongitude(longitude: Longitude | null): void {
    this._longitude = longitude;
  }

  updateOrientation(orientation: Orientation | null): void {
    this._orientation = orientation;
  }

  updateIso(iso: Iso | null): void {
    this._iso = iso;
  }

  updateLensMake(lensMake: LensMake | null): void {
    this._lensMake = lensMake;
  }

  updateLensModel(lensModel: LensModel | null): void {
    this._lensModel = lensModel;
  }

  updateLensSerial(lensSerial: LensSerial | null): void {
    this._lensSerial = lensSerial;
  }

  updateFocalLength(focalLength: FocalLength | null): void {
    this._focalLength = focalLength;
  }

  updateFocalLength35mm(focalLength35mm: FocalLength35mm | null): void {
    this._focalLength35mm = focalLength35mm;
  }

  updateAperture(aperture: Aperture | null): void {
    this._aperture = aperture;
  }

  updateShutterSpeed(shutterSpeed: ShutterSpeed | null): void {
    this._shutterSpeed = shutterSpeed;
  }
}
