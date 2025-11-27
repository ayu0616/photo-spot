import { z } from "zod";
import { SpotEntity } from "./domain/spot.entity";
import { CityId } from "./domain/value-object/city-id";
import { SpotId } from "./domain/value-object/spot-id";
import { SpotName } from "./domain/value-object/spot-name";

export const SpotDtoSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  cityId: z.number().int().positive(),
});

export type SpotDto = z.infer<typeof SpotDtoSchema>;

export const SpotDtoMapper = {
  fromEntity(entity: SpotEntity): SpotDto {
    return {
      id: entity.id.value,
      name: entity.name.value,
      cityId: entity.cityId.value,
    };
  },

  toEntity(dto: SpotDto): SpotEntity {
    const id = new SpotId(dto.id);
    const name = new SpotName(dto.name);
    const cityId = new CityId(dto.cityId);
    return SpotEntity.from(id, name, cityId);
  },
};
