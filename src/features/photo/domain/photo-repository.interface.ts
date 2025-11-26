import type { PhotoEntity } from "./photo.entity";

export interface IPhotoRepository {
  save(photo: PhotoEntity): Promise<void>;
  findById(id: string): Promise<PhotoEntity | null>;
}
