// src/dto/photo-dto.ts

import { z } from "zod";
import { PhotoEntity } from "../domain/photo/photo.entity";
import { Aperture } from "../domain/photo/value-object/aperture";
import { CameraMake } from "../domain/photo/value-object/camera-make";
import { CameraModel } from "../domain/photo/value-object/camera-model";
import { FocalLength } from "../domain/photo/value-object/focal-length";
import { FocalLength35mm } from "../domain/photo/value-object/focal-length-35mm";
import { Iso } from "../domain/photo/value-object/iso";
import { Latitude } from "../domain/photo/value-object/latitude";
import { LensMake } from "../domain/photo/value-object/lens-make";
import { LensModel } from "../domain/photo/value-object/lens-model";
import { LensSerial } from "../domain/photo/value-object/lens-serial";
import { Longitude } from "../domain/photo/value-object/longitude";
import { Orientation } from "../domain/photo/value-object/orientation";
import { PhotoExif } from "../domain/photo/value-object/photo-exif";
import { PhotoId } from "../domain/photo/value-object/photo-id";
import { PhotoUrl } from "../domain/photo/value-object/photo-url";
import { TakenAt } from "../domain/photo/value-object/taken-at";

export const PhotoDtoSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  exif: z.string().nullable(),
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
});

export type PhotoDto = z.infer<typeof PhotoDtoSchema>;

export const PhotoDtoMapper = {
  fromEntity(entity: PhotoEntity): PhotoDto {
    return {
      id: entity.id.value,
      url: entity.url.value,
      exif: entity.exif.value,
      takenAt: entity.takenAt.value,
      cameraMake: entity.cameraMake.value,
      cameraModel: entity.cameraModel.value,
      latitude: entity.latitude.value,
      longitude: entity.longitude.value,
      orientation: entity.orientation.value,
      iso: entity.iso.value,
      lensMake: entity.lensMake.value,
      lensModel: entity.lensModel.value,
      lensSerial: entity.lensSerial.value,
      focalLength: entity.focalLength.value,
      focalLength35mm: entity.focalLength35mm.value,
      aperture: entity.aperture.value,
    };
  },

  toEntity(dto: PhotoDto): PhotoEntity {
    const id = new PhotoId(dto.id);
    const url = new PhotoUrl(dto.url);
    const exif = new PhotoExif(dto.exif);
    const takenAt = new TakenAt(dto.takenAt);
    const cameraMake = new CameraMake(dto.cameraMake);
    const cameraModel = new CameraModel(dto.cameraModel);
    const latitude = new Latitude(dto.latitude);
    const longitude = new Longitude(dto.longitude);
    const orientation = new Orientation(dto.orientation);
    const iso = new Iso(dto.iso);
    const lensMake = new LensMake(dto.lensMake);
    const lensModel = new LensModel(dto.lensModel);
    const lensSerial = new LensSerial(dto.lensSerial);
    const focalLength = new FocalLength(dto.focalLength);
    const focalLength35mm = new FocalLength35mm(dto.focalLength35mm);
    const aperture = new Aperture(dto.aperture);

    return new PhotoEntity(
      id,
      url,
      exif,
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
    );
  },
};
