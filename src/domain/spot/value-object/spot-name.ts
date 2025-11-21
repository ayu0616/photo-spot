export class SpotName {
  readonly value: string;

  constructor(value: string) {
    if (!SpotName.isValid(value)) {
      throw new Error("Invalid SpotName");
    }
    this.value = value;
  }

  equals(other: SpotName): boolean {
    return this.value === other.value;
  }

  static isValid(value: string): boolean {
    return value.length > 0 && value.length <= 255;
  }
}
