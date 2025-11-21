export class PostDescription {
  readonly value: string;

  constructor(value: string) {
    if (!PostDescription.isValid(value)) {
      throw new Error("Invalid PostDescription");
    }
    this.value = value;
  }

  equals(other: PostDescription): boolean {
    return this.value === other.value;
  }

  static isValid(value: string): boolean {
    return value.length > 0 && value.length <= 255;
  }
}
