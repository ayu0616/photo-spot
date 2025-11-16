// src/dto/photo-dto.ts

import { z } from "zod";
import { PhotoEntity } from "../domain/photo/photo.entity";
import { PhotoId } from "../domain/photo/value-object/photo-id";
import { PhotoUrl } from "../domain/photo/value-object/photo-url";
import { PhotoExif } from "../domain/photo/value-object/photo-exif";

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

export class PhotoDtoMapper {
  static fromEntity(entity: PhotoEntity): PhotoDto {
    return {
      id: entity.id.value,
      url: entity.url.value,
      exif: entity.exif.value,
      takenAt: entity.takenAt,
      cameraMake: entity.cameraMake,
      cameraModel: entity.cameraModel,
      latitude: entity.latitude,
      longitude: entity.longitude,
      orientation: entity.orientation,
      iso: entity.iso,
      lensMake: entity.lensMake,
      lensModel: entity.lensModel,
      lensSerial: entity.lensSerial,
      focalLength: entity.focalLength,
      focalLength35mm: entity.focalLength35mm,
      aperture: entity.aperture,
    };
  }

  static toEntity(dto: PhotoDto): PhotoEntity {
    const id = new PhotoId(dto.id);
    const url = new PhotoUrl(dto.url);
    const exif = new PhotoExif(dto.exif);
    return new PhotoEntity(
      id,
      url,
      exif,
      dto.takenAt,
      dto.cameraMake,
      dto.cameraModel,
      dto.latitude,
      dto.longitude,
      dto.orientation,
      dto.iso,
      dto.lensMake,
      dto.lensModel,
      dto.lensSerial,
      dto.focalLength,
      dto.focalLength35mm,
      dto.aperture,
    );
  }
}
