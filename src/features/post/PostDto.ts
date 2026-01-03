import { z } from "zod";
import { CreatedAt } from "@/features/common/domain/value-object/created-at";
import { UpdatedAt } from "@/features/common/domain/value-object/updated-at";
import { PhotoId } from "../photo/domain/value-object/photo-id";
import { SpotId } from "../spot/domain/value-object/spot-id";
import { TripId } from "../trip/domain/value-object/trip-id";
import { UserId } from "../user/domain/value-object/user-id";
import { PostEntity } from "./domain/post.entity";
import { PostDescription } from "./domain/value-object/post-description";
import { PostId } from "./domain/value-object/post-id";

export const PostDtoSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  description: z.string().min(1).max(255),
  spotId: z.string().uuid(),
  photoId: z.string().uuid(),
  tripId: z.string().uuid().nullable(),
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
      tripId: entity.tripId ? entity.tripId.value : null,
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
    const tripId = dto.tripId ? new TripId(dto.tripId) : null;
    const createdAt = new CreatedAt(dto.createdAt);
    const updatedAt = new UpdatedAt(dto.updatedAt);
    return PostEntity.from(
      id,
      userId,
      description,
      spotId,
      photoId,
      tripId,
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

// TripのDTOスキーマを定義
export const TripForPostDtoSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
});

export type TripForPostDto = z.infer<typeof TripForPostDtoSchema>;

// 関連情報を含むPostのDTOスキーマを定義
export const PostWithRelationsDtoSchema = PostDtoSchema.extend({
  user: UserForPostDtoSchema,
  spot: SpotForPostDtoSchema,
  photo: PhotoForPostDtoSchema,
  trip: TripForPostDtoSchema.nullable(),
});

export type PostWithRelationsDto = z.infer<typeof PostWithRelationsDtoSchema>;
