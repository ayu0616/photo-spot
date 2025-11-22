import type { CreatedAt } from "../common/value-object/created-at";
import type { UpdatedAt } from "../common/value-object/updated-at";
import type { UserId } from "../user/value-object/user-id";
import type { TripDescription } from "./value-object/trip-description";
import type { TripId } from "./value-object/trip-id";
import type { TripTitle } from "./value-object/trip-title";

export class TripEntity {
  private readonly _id: TripId;
  private readonly _userId: UserId;
  private _title: TripTitle;
  private _description: TripDescription;
  private readonly _createdAt: CreatedAt;
  private _updatedAt: UpdatedAt;

  constructor(
    id: TripId,
    userId: UserId,
    title: TripTitle,
    description: TripDescription,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
  ) {
    this._id = id;
    this._userId = userId;
    this._title = title;
    this._description = description;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): TripId {
    return this._id;
  }

  get userId(): UserId {
    return this._userId;
  }

  get title(): TripTitle {
    return this._title;
  }

  get description(): TripDescription {
    return this._description;
  }

  get createdAt(): CreatedAt {
    return this._createdAt;
  }

  get updatedAt(): UpdatedAt {
    return this._updatedAt;
  }

  updateTitle(title: TripTitle): void {
    this._title = title;
  }

  updateDescription(description: TripDescription): void {
    this._description = description;
  }
}
