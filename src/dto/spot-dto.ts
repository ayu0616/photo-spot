// src/dto/spot-dto.ts

import { z } from "zod";
import { SpotEntity } from "../domain/spot/spot.entity";
import { SpotId } from "../domain/spot/value-object/spot-id";
import { SpotName } from "../domain/spot/value-object/spot-name";
import { CityId } from "../domain/spot/value-object/city-id";

export const SpotDtoSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  cityId: z.number().int().positive(),
});

export type SpotDto = z.infer<typeof SpotDtoSchema>;

export class SpotDtoMapper {
  static fromEntity(entity: SpotEntity): SpotDto {
    return {
      id: entity.id.value,
      name: entity.name.value,
      cityId: entity.cityId.value,
    };
  }

  static toEntity(dto: SpotDto): SpotEntity {
    const id = new SpotId(dto.id);
    const name = new SpotName(dto.name);
    const cityId = new CityId(dto.cityId);
    return new SpotEntity(id, name, cityId);
  }
}