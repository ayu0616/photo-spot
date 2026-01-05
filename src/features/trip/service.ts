import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { and, eq, gte, lt, lte } from "drizzle-orm";
import { db } from "@/db";
import { TripsTable } from "@/db/schema";

export type Trip = InferSelectModel<typeof TripsTable>;
export type NewTrip = InferInsertModel<typeof TripsTable>;

export async function createTrip(trip: NewTrip): Promise<Trip> {
  const [newTrip] = await db.insert(TripsTable).values(trip).returning();
  return newTrip;
}

export async function updateTrip(
  id: string,
  trip: Partial<NewTrip>,
): Promise<Trip> {
  const [updatedTrip] = await db
    .update(TripsTable)
    .set({ ...trip, updatedAt: new Date() })
    .where(eq(TripsTable.id, id))
    .returning();
  if (!updatedTrip) throw new Error("Trip not found");
  return updatedTrip;
}

export async function deleteTrip(id: string): Promise<void> {
  await db.delete(TripsTable).where(eq(TripsTable.id, id));
}

export async function getTrip(id: string): Promise<Trip | null> {
  const trip = await db.query.TripsTable.findFirst({
    where: eq(TripsTable.id, id),
  });
  return trip ?? null;
}

export async function getAllTrips(): Promise<Trip[]> {
  return await db.query.TripsTable.findMany({
    orderBy: (trips, { desc }) => [desc(trips.createdAt)],
  });
}

export async function getTripByDate(
  date: string,
  userId: string,
): Promise<Trip[]> {
  return await db.query.TripsTable.findMany({
    where: and(
      eq(TripsTable.userId, userId),
      lte(TripsTable.startedAt, date),
      gte(TripsTable.endedAt, date),
    ),
    orderBy: (trips, { desc }) => [desc(trips.createdAt)],
  });
}

export async function getTripByYear(
  year: number,
  userId: string,
): Promise<Trip[]> {
  const firstDayOfYear = `${year}-01-01`;
  const firstDayOfNextYear = `${year + 1}-01-01`;
  return await db.query.TripsTable.findMany({
    where: and(
      eq(TripsTable.userId, userId),
      gte(TripsTable.endedAt, firstDayOfYear),
      lt(TripsTable.startedAt, firstDayOfNextYear),
    ),
    orderBy: (trips, { asc }) => [asc(trips.startedAt)],
  });
}
