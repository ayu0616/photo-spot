import { z } from "zod";

export class Url {
  private readonly _value: string;

  constructor(value: string) {
    if (!Url.isValid(value)) {
      throw new Error("Invalid URL");
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  equals(other: Url): boolean {
    return this._value === other.value;
  }

  static isValid(value: string): boolean {
    return z.url().safeParse(value).success;
  }
}
