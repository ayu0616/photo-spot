import type { CityId } from "./value-object/city-id";
import { SpotId } from "./value-object/spot-id";
import type { SpotName } from "./value-object/spot-name";

export class SpotEntity {
  private readonly _id: SpotId;
  private _name: SpotName;
  private _cityId: CityId;

  private constructor(id: SpotId, name: SpotName, cityId: CityId) {
    this._id = id;
    this._name = name;
    this._cityId = cityId;
  }

  static create(name: SpotName, cityId: CityId): SpotEntity {
    const id = SpotId.create();
    return new SpotEntity(id, name, cityId);
  }

  static from(id: SpotId, name: SpotName, cityId: CityId): SpotEntity {
    return new SpotEntity(id, name, cityId);
  }

  get id(): SpotId {
    return this._id;
  }

  get name(): SpotName {
    return this._name;
  }

  get cityId(): CityId {
    return this._cityId;
  }

  equals(other: SpotEntity): boolean {
    return this._id.equals(other.id);
  }

  updateName(name: SpotName): void {
    this._name = name;
  }

  updateCityId(cityId: CityId): void {
    this._cityId = cityId;
  }
}
