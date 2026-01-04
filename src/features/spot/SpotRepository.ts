import { eq, inArray } from "drizzle-orm";
import { injectable } from "inversify";
import { db } from "../../db";
import {
  CityMasterTable,
  PostsTable,
  SpotsTable,
  TripsTable,
} from "../../db/schema";
import type { SpotEntity } from "./domain/spot.entity";
import type { ISpotRepository } from "./domain/spot-repository.interface";
import { SpotDtoMapper } from "./SpotDto";

@injectable()
export class SpotRepository implements ISpotRepository {
  async save(spot: SpotEntity): Promise<void> {
    const spotDto = SpotDtoMapper.fromEntity(spot, 0);
    await db.insert(SpotsTable).values({
      id: spotDto.id,
      name: spotDto.name,
      cityId: spotDto.cityId,
    });
  }

  async findById(id: string): Promise<SpotEntity | null> {
    const spotDto = await db.query.SpotsTable.findFirst({
      where: eq(SpotsTable.id, id),
    });
    if (!spotDto) {
      return null;
    }
    return SpotDtoMapper.toEntity({ ...spotDto, prefectureId: 0 });
  }

  async findByNameAndCityId(
    name: string,
    cityId: number,
  ): Promise<SpotEntity | null> {
    const spotDto = await db.query.SpotsTable.findFirst({
      where: (spots, { and, eq }) =>
        and(eq(spots.name, name), eq(spots.cityId, cityId)),
    });
    if (!spotDto) {
      return null;
    }
    return SpotDtoMapper.toEntity({ ...spotDto, prefectureId: 0 });
  }

  async findAll(): Promise<(SpotEntity & { prefectureId: number })[]> {
    const results = await db
      .select({
        spot: SpotsTable,
        prefectureId: CityMasterTable.prefectureId,
      })
      .from(SpotsTable)
      .innerJoin(CityMasterTable, eq(SpotsTable.cityId, CityMasterTable.id));

    return results.map((row) => {
      const entity = SpotDtoMapper.toEntity({
        ...row.spot,
        prefectureId: row.prefectureId,
      });
      return Object.assign(entity, { prefectureId: row.prefectureId });
    });
  }

  async getSpotNamesByTrips(
    tripIds: string[],
  ): Promise<Record<string, SpotEntity[]>> {
    const results = await db
      .selectDistinct({
        spot: SpotsTable,
        tripId: TripsTable.id,
      })
      .from(PostsTable)
      .innerJoin(SpotsTable, eq(PostsTable.spotId, SpotsTable.id))
      .innerJoin(TripsTable, eq(PostsTable.tripId, TripsTable.id))
      .where(inArray(TripsTable.id, tripIds));

    return results.reduce(
      (prev, cur) => {
        if (prev[cur.tripId]) {
          prev[cur.tripId].push(
            SpotDtoMapper.toEntity({ ...cur.spot, prefectureId: 0 }),
          );
        } else {
          prev[cur.tripId] = [
            SpotDtoMapper.toEntity({ ...cur.spot, prefectureId: 0 }),
          ];
        }
        return prev;
      },
      {} as Record<string, SpotEntity[]>,
    );
  }
}
