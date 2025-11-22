import z from "zod";

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
    return z.string().min(0).max(255).safeParse(value).success;
  }
}
