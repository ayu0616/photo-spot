export class PhotoExif {
  readonly value: string;

  constructor(value: string) {
    if (!PhotoExif.isValid(value)) {
      throw new Error("Invalid PhotoExif");
    }
    this.value = value;
  }

  equals(other: PhotoExif): boolean {
    return this.value === other.value;
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
