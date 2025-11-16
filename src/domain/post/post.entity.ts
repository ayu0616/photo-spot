// src/domain/post/post.entity.ts

import type { PhotoId } from "../photo/photo-id/photo-id";
import type { SpotId } from "../spot/spot-id/spot-id";
import type { PostDescription } from "./post-description/post-description";
import type { PostId } from "./post-id/post-id";
import type { UserId } from "./user-id/user-id";

export class PostEntity {
  readonly id: PostId;
  userId: UserId;
  description: PostDescription;
  spotId: SpotId;
  photoId: PhotoId;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(
    id: PostId,
    userId: UserId,
    description: PostDescription,
    spotId: SpotId,
    photoId: PhotoId,
    createdAt: Date,
    updatedAt: Date,
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
    this.updatedAt = new Date();
  }

  updateSpotId(spotId: SpotId): void {
    this.spotId = spotId;
    this.updatedAt = new Date();
  }

  updatePhotoId(photoId: PhotoId): void {
    this.photoId = photoId;
    this.updatedAt = new Date();
  }
}
