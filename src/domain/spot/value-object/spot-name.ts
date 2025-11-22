export class SpotName {
  private readonly _value: string;

  constructor(value: string) {
    if (!SpotName.isValid(value)) {
      throw new Error("Invalid SpotName");
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  equals(other: SpotName): boolean {
    return this._value === other.value;
  }

  static isValid(value: string): boolean {
    return value.length > 0 && value.length <= 255;
  }
}
