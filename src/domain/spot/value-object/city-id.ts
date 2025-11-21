export class CityId {
  readonly value: number;

  constructor(value: number) {
    if (!CityId.isValid(value)) {
      throw new Error("Invalid CityId");
    }
    this.value = value;
  }

  equals(other: CityId): boolean {
    return this.value === other.value;
  }

  static isValid(value: number): boolean {
    return value > 0;
  }
}
