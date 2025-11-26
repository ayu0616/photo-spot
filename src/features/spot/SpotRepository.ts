import { eq } from "drizzle-orm";
import { injectable } from "inversify";
import { db } from "../../db";
import { SpotsTable } from "../../db/schema";
import type { SpotEntity } from "./domain/spot.entity";
import type { ISpotRepository } from "./domain/spot-repository.interface";
import { SpotDtoMapper } from "./SpotDto";

@injectable()
export class SpotRepository implements ISpotRepository {
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

  async findAll(): Promise<SpotEntity[]> {
    const spotDtos = await db.query.SpotsTable.findMany();
    return spotDtos.map((dto: typeof SpotsTable.$inferSelect) =>
      SpotDtoMapper.toEntity(dto),
    );
  }
}
