import type { CreatedAt } from "@/features/common/domain/value-object/created-at";
import type { PhotoId } from "../../photo/domain/value-object/photo-id";
import type { SpotId } from "../../spot/domain/value-object/spot-id";
import type { TripId } from "../../trip/domain/value-object/trip-id";
import type { UserId } from "../../user/domain/value-object/user-id";
import type { PostDescription } from "./value-object/post-description";
import type { PostId } from "./value-object/post-id";
import { UpdatedAt } from "./value-object/updated-at";

export class PostEntity {
  private readonly _id: PostId;
  private _userId: UserId;
  private _description: PostDescription;
  private _spotId: SpotId;
  private _photoId: PhotoId;
  private _tripId: TripId | null;
  private readonly _createdAt: CreatedAt;
  private _updatedAt: UpdatedAt;

  constructor(
    id: PostId,
    userId: UserId,
    description: PostDescription,
    spotId: SpotId,
    photoId: PhotoId,
    tripId: TripId | null,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
  ) {
    this._id = id;
    this._userId = userId;
    this._description = description;
    this._spotId = spotId;
    this._photoId = photoId;
    this._tripId = tripId;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): PostId {
    return this._id;
  }

  get userId(): UserId {
    return this._userId;
  }

  get description(): PostDescription {
    return this._description;
  }

  get spotId(): SpotId {
    return this._spotId;
  }

  get photoId(): PhotoId {
    return this._photoId;
  }

  get tripId(): TripId | null {
    return this._tripId;
  }

  get createdAt(): CreatedAt {
    return this._createdAt;
  }

  get updatedAt(): UpdatedAt {
    return this._updatedAt;
  }

  equals(other: PostEntity): boolean {
    return this._id.equals(other.id);
  }

  updateDescription(description: PostDescription): void {
    this._description = description;
    this._updatedAt = new UpdatedAt(new Date());
  }

  updateSpotId(spotId: SpotId): void {
    this._spotId = spotId;
    this._updatedAt = new UpdatedAt(new Date());
  }

  updatePhotoId(photoId: PhotoId): void {
    this._photoId = photoId;
    this._updatedAt = new UpdatedAt(new Date());
  }

  updateTripId(tripId: TripId | null): void {
    this._tripId = tripId;
    this._updatedAt = new UpdatedAt(new Date());
  }
}
