export class PhotoExif {
  private readonly _value: string;

  constructor(value: string) {
    if (!PhotoExif.isValid(value)) {
      throw new Error("Invalid PhotoExif");
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  equals(other: PhotoExif): boolean {
    return this._value === other.value;
  }

  static isValid(value: string): boolean {
    try {
      JSON.parse(value);
      return true;
    } catch (_e) {
      return false;
    }
  }
}
