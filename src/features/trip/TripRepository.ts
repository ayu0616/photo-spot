import { eq } from "drizzle-orm";
import { injectable } from "inversify";
import { db } from "@/db";
import { TripsTable } from "@/db/schema";
import { UserId } from "@/features/user/domain/value-object/user-id";
import { CreatedAt } from "../common/domain/value-object/created-at";
import { UpdatedAt } from "../common/domain/value-object/updated-at";
import { TripEntity } from "./domain/trip.entity";
import type { ITripRepository } from "./domain/trip-repository.interface";
import { TripDescription } from "./domain/value-object/trip-description";
import { TripEndedAt } from "./domain/value-object/trip-ended-at";
import { TripId } from "./domain/value-object/trip-id";
import { TripStartedAt } from "./domain/value-object/trip-started-at";
import { TripTitle } from "./domain/value-object/trip-title";

@injectable()
export class TripRepository implements ITripRepository {
  async save(trip: TripEntity): Promise<void> {
    await db
      .insert(TripsTable)
      .values({
        id: trip.id.value,
        userId: trip.userId.value,
        title: trip.title.value,
        description: trip.description.value,
        startedAt: trip.startedAt.value,
        endedAt: trip.endedAt.value,
        createdAt: trip.createdAt.value,
        updatedAt: trip.updatedAt.value,
      })
      .onConflictDoUpdate({
        target: TripsTable.id,
        set: {
          title: trip.title.value,
          description: trip.description.value,
          startedAt: trip.startedAt.value,
          endedAt: trip.endedAt.value,
          updatedAt: trip.updatedAt.value,
        },
      });
  }

  async findById(id: string): Promise<TripEntity | null> {
    const trip = await db.query.TripsTable.findFirst({
      where: eq(TripsTable.id, id),
    });

    if (!trip) {
      return null;
    }

    return TripEntity.from(
      new TripId(trip.id),
      new UserId(trip.userId),
      new TripTitle(trip.title),
      new TripDescription(trip.description),
      new TripStartedAt(trip.startedAt ?? ""),
      new TripEndedAt(trip.endedAt ?? ""),
      new CreatedAt(trip.createdAt),
      new UpdatedAt(trip.updatedAt),
    );
  }

  async findAll(): Promise<TripEntity[]> {
    const trips = await db.query.TripsTable.findMany({
      orderBy: (trips, { desc }) => [desc(trips.createdAt)],
    });

    return trips.map((trip) =>
      TripEntity.from(
        new TripId(trip.id),
        new UserId(trip.userId),
        new TripTitle(trip.title),
        new TripDescription(trip.description),
        new TripStartedAt(trip.startedAt ?? ""),
        new TripEndedAt(trip.endedAt ?? ""),
        new CreatedAt(trip.createdAt),
        new UpdatedAt(trip.updatedAt),
      ),
    );
  }

  async delete(id: string): Promise<void> {
    await db.delete(TripsTable).where(eq(TripsTable.id, id));
  }
}
