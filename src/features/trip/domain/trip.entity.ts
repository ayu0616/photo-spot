import { CreatedAt } from "@/features/common/domain/value-object/created-at";
import { UpdatedAt } from "@/features/common/domain/value-object/updated-at";
import type { UserId } from "@/features/user/domain/value-object/user-id";
import type { TripDescription } from "./value-object/trip-description";
import type { TripEndedAt } from "./value-object/trip-ended-at";
import { TripId } from "./value-object/trip-id";
import type { TripStartedAt } from "./value-object/trip-started-at";
import type { TripTitle } from "./value-object/trip-title";

export class TripEntity {
  private readonly _id: TripId;
  private readonly _userId: UserId;
  private _title: TripTitle;
  private _description: TripDescription;
  private _startedAt: TripStartedAt;
  private _endedAt: TripEndedAt;
  private readonly _createdAt: CreatedAt;
  private _updatedAt: UpdatedAt;

  private constructor(
    id: TripId,
    userId: UserId,
    title: TripTitle,
    description: TripDescription,
    startedAt: TripStartedAt,
    endedAt: TripEndedAt,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
  ) {
    this._id = id;
    this._userId = userId;
    this._title = title;
    this._description = description;
    this._startedAt = startedAt;
    this._endedAt = endedAt;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  static create(
    userId: UserId,
    title: TripTitle,
    description: TripDescription,
    startedAt: TripStartedAt,
    endedAt: TripEndedAt,
  ): TripEntity {
    const id = TripId.create();
    const createdAt = CreatedAt.create();
    const updatedAt = UpdatedAt.create();
    return new TripEntity(
      id,
      userId,
      title,
      description,
      startedAt,
      endedAt,
      createdAt,
      updatedAt,
    );
  }

  static from(
    id: TripId,
    userId: UserId,
    title: TripTitle,
    description: TripDescription,
    startedAt: TripStartedAt,
    endedAt: TripEndedAt,
    createdAt: CreatedAt,
    updatedAt: UpdatedAt,
  ): TripEntity {
    return new TripEntity(
      id,
      userId,
      title,
      description,
      startedAt,
      endedAt,
      createdAt,
      updatedAt,
    );
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

  get startedAt(): TripStartedAt {
    return this._startedAt;
  }

  get endedAt(): TripEndedAt {
    return this._endedAt;
  }

  get createdAt(): CreatedAt {
    return this._createdAt;
  }

  get updatedAt(): UpdatedAt {
    return this._updatedAt;
  }

  updateTitle(title: TripTitle): void {
    this._title = title;
    this._updatedAt = UpdatedAt.create();
  }

  updateDescription(description: TripDescription): void {
    this._description = description;
    this._updatedAt = UpdatedAt.create();
  }

  updateStartedAt(startedAt: TripStartedAt) {
    this._startedAt = startedAt;
    this._updatedAt = UpdatedAt.create();
  }

  updateEndedAt(endedAt: TripEndedAt) {
    this._endedAt = endedAt;
    this._updatedAt = UpdatedAt.create();
  }
}
