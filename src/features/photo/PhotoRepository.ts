import { eq } from "drizzle-orm";
import { injectable } from "inversify";
import { db } from "../../db";
import { PhotosTable } from "../../db/schema";
import type { PhotoEntity } from "./domain/photo.entity";
import type { IPhotoRepository } from "./domain/photo-repository.interface";
import { PhotoDtoMapper } from "./PhotoDto";

@injectable()
export class PhotoRepository implements IPhotoRepository {
  async save(photo: PhotoEntity): Promise<void> {
    const photoDto = PhotoDtoMapper.fromEntity(photo);
    await db.insert(PhotosTable).values({
      id: photoDto.id,
      url: photoDto.url,
      exif: photoDto.exif,
      takenAt: photoDto.takenAt,
      cameraMake: photoDto.cameraMake,
      cameraModel: photoDto.cameraModel,
      latitude: photoDto.latitude,
      longitude: photoDto.longitude,
      orientation: photoDto.orientation,
      iso: photoDto.iso,
      lensMake: photoDto.lensMake,
      lensModel: photoDto.lensModel,
      lensSerial: photoDto.lensSerial,
      focalLength: photoDto.focalLength,
      focalLength35mm: photoDto.focalLength35mm,
      aperture: photoDto.aperture,
      shutterSpeed: photoDto.shutterSpeed,
    });
  }

  async findById(id: string): Promise<PhotoEntity | null> {
    const photoDto = await db.query.PhotosTable.findFirst({
      where: eq(PhotosTable.id, id),
    });
    if (!photoDto) {
      return null;
    }
    return PhotoDtoMapper.toEntity(photoDto);
  }
}
