import type { CreatedAt } from "../common/value-object/created-at";
import type { UpdatedAt } from "../common/value-object/updated-at";
import type { TripDescription } from "./value-object/trip-description";
import type { TripId } from "./value-object/trip-id";
import type { TripTitle } from "./value-object/trip-title";

export class TripEntity {
  private readonly _id: TripId;
  private _title: TripTitle;
  private _description: TripDescription;
  private readonly _createdAt: CreatedAt;
  private _updatedAt: UpdatedAt;

  constructor(
    id: TripId,
    title: TripTitle,
    description: TripDescription,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
  ) {
    this._id = id;
    this._title = title;
    this._description = description;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): TripId {
    return this._id;
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
