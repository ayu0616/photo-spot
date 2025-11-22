import { z } from "zod";
import { PhotoId } from "../domain/photo/value-object/photo-id";
import { PostEntity } from "../domain/post/post.entity";
import { CreatedAt } from "../domain/post/value-object/created-at";
import { PostDescription } from "../domain/post/value-object/post-description";
import { PostId } from "../domain/post/value-object/post-id";
import { UpdatedAt } from "../domain/post/value-object/updated-at";
import { SpotId } from "../domain/spot/value-object/spot-id";
import { UserId } from "../domain/user/value-object/user-id";

export const PostDtoSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  description: z.string().min(1).max(255),
  spotId: z.string().uuid(),
  photoId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PostDto = z.infer<typeof PostDtoSchema>;

export const PostDtoMapper = {
  fromEntity(entity: PostEntity): PostDto {
    return {
      id: entity.id.value,
      userId: entity.userId.value,
      description: entity.description.value,
      spotId: entity.spotId.value,
      photoId: entity.photoId.value,
      createdAt: entity.createdAt.value,
      updatedAt: entity.updatedAt.value,
    };
  },

  toEntity(dto: PostDto): PostEntity {
    const id = new PostId(dto.id);
    const userId = new UserId(dto.userId);
    const description = new PostDescription(dto.description);
    const spotId = new SpotId(dto.spotId);
    const photoId = new PhotoId(dto.photoId);
    const createdAt = new CreatedAt(dto.createdAt);
    const updatedAt = new UpdatedAt(dto.updatedAt);
    return new PostEntity(
      id,
      userId,
      description,
      spotId,
      photoId,
      createdAt,
      updatedAt,
    );
  },
};

// UserのDTOスキーマを定義
export const UserForPostDtoSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
  image: z.string().nullable(),
});

export type UserForPostDto = z.infer<typeof UserForPostDtoSchema>;

// PrefectureのDTOスキーマを定義
export const PrefectureForPostDtoSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type PrefectureForPostDto = z.infer<typeof PrefectureForPostDtoSchema>;

// CityのDTOスキーマを定義
export const CityForPostDtoSchema = z.object({
  id: z.number(),
  name: z.string(),
  prefecture: PrefectureForPostDtoSchema,
});

export type CityForPostDto = z.infer<typeof CityForPostDtoSchema>;

// SpotのDTOスキーマを定義
export const SpotForPostDtoSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  city: CityForPostDtoSchema,
});

export type SpotForPostDto = z.infer<typeof SpotForPostDtoSchema>;

// PhotoのDTOスキーマを定義
export const PhotoForPostDtoSchema = z.object({
  id: z.string().uuid(),
  url: z.string(),
  exif: z.string().nullable(),
  takenAt: z.date().nullable(),
  cameraMake: z.string().nullable(),
  cameraModel: z.string().nullable(),
  latitude: z.string().nullable(),
  longitude: z.string().nullable(),
  orientation: z.number().nullable(),
  iso: z.number().nullable(),
  lensMake: z.string().nullable(),
  lensModel: z.string().nullable(),
  lensSerial: z.string().nullable(),
  focalLength: z.string().nullable(),
  focalLength35mm: z.string().nullable(),
  aperture: z.string().nullable(),
  shutterSpeed: z.string().nullable(),
});

export type PhotoForPostDto = z.infer<typeof PhotoForPostDtoSchema>;

// 関連情報を含むPostのDTOスキーマを定義
export const PostWithRelationsDtoSchema = PostDtoSchema.extend({
  user: UserForPostDtoSchema,
  spot: SpotForPostDtoSchema,
  photo: PhotoForPostDtoSchema,
});

export type PostWithRelationsDto = z.infer<typeof PostWithRelationsDtoSchema>;
