import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  CityMasterTable,
  PostsTable,
  SpotsTable,
  TripsTable,
} from "@/db/schema";

export type Spot = InferSelectModel<typeof SpotsTable>;
export type NewSpot = InferInsertModel<typeof SpotsTable>;
export type SpotWithPrefecture = Spot & { prefectureId: number };

export async function createSpot(spot: NewSpot): Promise<Spot> {
  const [newSpot] = await db.insert(SpotsTable).values(spot).returning();
  return newSpot;
}

export async function getSpot(id: string): Promise<Spot | null> {
  const [spot] = await db
    .select()
    .from(SpotsTable)
    .where(eq(SpotsTable.id, id));
  return spot ?? null;
}

export async function findSpotByNameAndCityId(
  name: string,
  cityId: number,
): Promise<Spot | null> {
  const [spot] = await db
    .select()
    .from(SpotsTable)
    .where(and(eq(SpotsTable.name, name), eq(SpotsTable.cityId, cityId)));
  return spot ?? null;
}

export async function getAllSpots(): Promise<SpotWithPrefecture[]> {
  const results = await db
    .select({
      spot: SpotsTable,
      prefectureId: CityMasterTable.prefectureId,
    })
    .from(SpotsTable)
    .innerJoin(CityMasterTable, eq(SpotsTable.cityId, CityMasterTable.id));

  return results.map((row) => ({
    ...row.spot,
    prefectureId: row.prefectureId,
  }));
}

export async function getSpotNamesByTrips(
  tripIds: string[],
): Promise<Record<string, string[]>> {
  if (tripIds.length === 0) {
    return {};
  }
  const results = await db
    .selectDistinct({
      spotName: SpotsTable.name,
      tripId: TripsTable.id,
    })
    .from(TripsTable)
    .innerJoin(PostsTable, eq(TripsTable.id, PostsTable.tripId))
    .innerJoin(SpotsTable, eq(PostsTable.spotId, SpotsTable.id))
    .where(inArray(TripsTable.id, tripIds));

  return results.reduce(
    (acc, cur) => {
      if (!acc[cur.tripId]) {
        acc[cur.tripId] = [];
      }
      acc[cur.tripId].push(cur.spotName);
      return acc;
    },
    {} as Record<string, string[]>,
  );
}
