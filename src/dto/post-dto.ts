// src/dto/post-dto.ts

import { z } from "zod";
import { PhotoId } from "../domain/photo/value-object/photo-id";
import { PostEntity } from "../domain/post/post.entity";
import { CreatedAt } from "../domain/post/value-object/created-at";
import { PostDescription } from "../domain/post/value-object/post-description";
import { PostId } from "../domain/post/value-object/post-id";
import { UpdatedAt } from "../domain/post/value-object/updated-at";
import { UserId } from "../domain/post/value-object/user-id";
import { SpotId } from "../domain/spot/value-object/spot-id";

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
