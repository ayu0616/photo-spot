import { z } from "zod";
import { PhotoEntity } from "./domain/photo.entity";
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
import { PhotoId } from "./domain/value-object/photo-id";
import { PhotoUrl } from "./domain/value-object/photo-url";
import { ShutterSpeed } from "./domain/value-object/shutter-speed";
import { TakenAt } from "./domain/value-object/taken-at";

export const PhotoDtoSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  takenAt: z.date().nullable(),
  cameraMake: z.string().nullable(),
  cameraModel: z.string().nullable(),
  latitude: z.string().nullable(),
  longitude: z.string().nullable(),
  orientation: z.number().int().nullable(),
  iso: z.number().int().nullable(),
  lensMake: z.string().nullable(),
  lensModel: z.string().nullable(),
  lensSerial: z.string().nullable(),
  focalLength: z.string().nullable(),
  focalLength35mm: z.string().nullable(),
  aperture: z.string().nullable(),
  shutterSpeed: z.string().nullable(),
});

export type PhotoDto = z.infer<typeof PhotoDtoSchema>;

export const PhotoDtoMapper = {
  fromEntity(entity: PhotoEntity): PhotoDto {
    return {
      id: entity.id.value,
      url: entity.url.value,
      takenAt: entity.takenAt ? entity.takenAt.value : null,
      cameraMake: entity.cameraMake ? entity.cameraMake.value : null,
      cameraModel: entity.cameraModel ? entity.cameraModel.value : null,
      latitude: entity.latitude ? entity.latitude.value : null,
      longitude: entity.longitude ? entity.longitude.value : null,
      orientation: entity.orientation ? entity.orientation.value : null,
      iso: entity.iso ? entity.iso.value : null,
      lensMake: entity.lensMake ? entity.lensMake.value : null,
      lensModel: entity.lensModel ? entity.lensModel.value : null,
      lensSerial: entity.lensSerial ? entity.lensSerial.value : null,
      focalLength: entity.focalLength ? entity.focalLength.value : null,
      focalLength35mm: entity.focalLength35mm
        ? entity.focalLength35mm.value
        : null,
      aperture: entity.aperture ? entity.aperture.value : null,
      shutterSpeed: entity.shutterSpeed ? entity.shutterSpeed.value : null,
    };
  },

  toEntity(dto: PhotoDto): PhotoEntity {
    const id = new PhotoId(dto.id);
    const url = new PhotoUrl(dto.url);
    const takenAt = dto.takenAt ? new TakenAt(dto.takenAt) : null;
    const cameraMake = dto.cameraMake ? new CameraMake(dto.cameraMake) : null;
    const cameraModel = dto.cameraModel
      ? new CameraModel(dto.cameraModel)
      : null;
    const latitude = dto.latitude ? new Latitude(dto.latitude) : null;
    const longitude = dto.longitude ? new Longitude(dto.longitude) : null;
    const orientation = dto.orientation
      ? new Orientation(dto.orientation)
      : null;
    const iso = dto.iso ? new Iso(dto.iso) : null;
    const lensMake = dto.lensMake ? new LensMake(dto.lensMake) : null;
    const lensModel = dto.lensModel ? new LensModel(dto.lensModel) : null;
    const lensSerial = dto.lensSerial ? new LensSerial(dto.lensSerial) : null;
    const focalLength = dto.focalLength
      ? new FocalLength(dto.focalLength)
      : null;
    const focalLength35mm = dto.focalLength35mm
      ? new FocalLength35mm(dto.focalLength35mm)
      : null;
    const aperture = dto.aperture ? new Aperture(dto.aperture) : null;
    const shutterSpeed = dto.shutterSpeed
      ? ShutterSpeed.of(dto.shutterSpeed)
      : null;

    return new PhotoEntity(
      id,
      url,
      takenAt,
      cameraMake,
      cameraModel,
      latitude,
      longitude,
      orientation,
      iso,
      lensMake,
      lensModel,
      lensSerial,
      focalLength,
      focalLength35mm,
      aperture,
      shutterSpeed,
    );
  },
};
