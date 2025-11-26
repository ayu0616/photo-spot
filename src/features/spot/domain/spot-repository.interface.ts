import type { SpotEntity } from "./spot.entity";

export interface ISpotRepository {
  save(spot: SpotEntity): Promise<void>;
  findById(id: string): Promise<SpotEntity | null>;
  findByNameAndCityId(name: string, cityId: number): Promise<SpotEntity | null>;
  findAll(): Promise<SpotEntity[]>;
}
