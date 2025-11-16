// src/domain/post/post.entity.ts

import type { PhotoId } from "../../photo/value-object/photo-id";
import type { SpotId } from "../../spot/value-object/spot-id";
import type { CreatedAt } from "./value-object/created-at";
import type { PostDescription } from "./value-object/post-description";
import type { PostId } from "./value-object/post-id";
import type { UpdatedAt } from "./value-object/updated-at";
import type { UserId } from "./value-object/user-id";

export class PostEntity {
  readonly id: PostId;
  userId: UserId;
  description: PostDescription;
  spotId: SpotId;
  photoId: PhotoId;
  readonly createdAt: CreatedAt;
  updatedAt: UpdatedAt;

  constructor(
    id: PostId,
    userId: UserId,
    description: PostDescription,
    spotId: SpotId,
    photoId: PhotoId,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
  ) {
    this.id = id;
    this.userId = userId;
    this.description = description;
    this.spotId = spotId;
    this.photoId = photoId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  equals(other: PostEntity): boolean {
    return this.id.equals(other.id);
  }

  updateDescription(description: PostDescription): void {
    this.description = description;
    this.updatedAt = new UpdatedAt(new Date());
  }

  updateSpotId(spotId: SpotId): void {
    this.spotId = spotId;
    this.updatedAt = new UpdatedAt(new Date());
  }

  updatePhotoId(photoId: PhotoId): void {
    this.photoId = photoId;
    this.updatedAt = new UpdatedAt(new Date());
  }
}
