import { eq } from "drizzle-orm";
import { injectable } from "inversify";
import { db } from "@/db";
import { TripsTable } from "@/db/schema";
import { CreatedAt } from "@/domain/common/value-object/created-at";
import { UpdatedAt } from "@/domain/common/value-object/updated-at";
import { TripEntity } from "@/domain/trip/trip.entity";
import type { ITripRepository } from "@/domain/trip/trip-repository.interface";
import { TripDescription } from "@/domain/trip/value-object/trip-description";
import { TripId } from "@/domain/trip/value-object/trip-id";
import { TripTitle } from "@/domain/trip/value-object/trip-title";

@injectable()
export class TripRepository implements ITripRepository {
  async save(trip: TripEntity): Promise<void> {
    await db
      .insert(TripsTable)
      .values({
        id: trip.id.value,
        title: trip.title.value,
        description: trip.description.value,
        createdAt: trip.createdAt.value,
        updatedAt: trip.updatedAt.value,
      })
      .onConflictDoUpdate({
        target: TripsTable.id,
        set: {
          title: trip.title.value,
          description: trip.description.value,
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

    return new TripEntity(
      new TripId(trip.id),
      new TripTitle(trip.title),
      new TripDescription(trip.description),
      new CreatedAt(trip.createdAt),
      new UpdatedAt(trip.updatedAt),
    );
  }

  async findAll(): Promise<TripEntity[]> {
    const trips = await db.query.TripsTable.findMany({
      orderBy: (trips, { desc }) => [desc(trips.createdAt)],
    });

    return trips.map(
      (trip) =>
        new TripEntity(
          new TripId(trip.id),
          new TripTitle(trip.title),
          new TripDescription(trip.description),
          new CreatedAt(trip.createdAt),
          new UpdatedAt(trip.updatedAt),
        ),
    );
  }

  async delete(id: string): Promise<void> {
    await db.delete(TripsTable).where(eq(TripsTable.id, id));
  }
}
