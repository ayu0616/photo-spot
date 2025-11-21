export class PostDescription {
  private readonly _value: string;

  constructor(value: string) {
    if (!PostDescription.isValid(value)) {
      throw new Error("Invalid PostDescription");
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  equals(other: PostDescription): boolean {
    return this._value === other.value;
  }

  static isValid(value: string): boolean {
    return value.length > 0 && value.length <= 255;
  }
}
