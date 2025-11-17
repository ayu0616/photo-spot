// src/repositories/spotRepository.ts

import { eq } from "drizzle-orm";
import { db } from "../db";
import { SpotsTable } from "../db/schema";
import type { SpotEntity } from "../domain/spot/spot.entity";
import { SpotDtoMapper } from "../dto/spot-dto";

export class SpotRepository {
  async save(spot: SpotEntity): Promise<void> {
    const spotDto = SpotDtoMapper.fromEntity(spot);
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
    return SpotDtoMapper.toEntity(spotDto);
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
    return SpotDtoMapper.toEntity(spotDto);
  }
}
