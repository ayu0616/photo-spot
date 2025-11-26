export class CityId {
  private readonly _value: number;

  constructor(value: number) {
    if (!CityId.isValid(value)) {
      throw new Error("Invalid CityId");
    }
    this._value = value;
  }

  get value(): number {
    return this._value;
  }

  equals(other: CityId): boolean {
    return this._value === other.value;
  }

  static isValid(value: number): boolean {
    return value > 0;
  }
}
