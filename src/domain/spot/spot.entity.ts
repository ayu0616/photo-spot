// src/domain/spot/spot.entity.ts

import type { CityId } from "./value-object/city-id";
import type { SpotId } from "./value-object/spot-id";
import type { SpotName } from "./value-object/spot-name";

export class SpotEntity {
  readonly id: SpotId;
  name: SpotName;
  cityId: CityId;

  constructor(id: SpotId, name: SpotName, cityId: CityId) {
    this.id = id;
    this.name = name;
    this.cityId = cityId;
  }

  equals(other: SpotEntity): boolean {
    return this.id.equals(other.id);
  }

  updateName(name: SpotName): void {
    this.name = name;
  }

  updateCityId(cityId: CityId): void {
    this.cityId = cityId;
  }
}
