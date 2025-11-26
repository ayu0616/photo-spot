import { z } from "zod";

export class UUID {
  private readonly _value: string;

  constructor(value: string) {
    if (!UUID.isValid(value)) {
      throw new Error("Invalid UUID");
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  equals(other: UUID): boolean {
    return this._value === other.value;
  }

  static isValid(value: string): boolean {
    return z.string().uuid().safeParse(value).success;
  }

  static create(): UUID {
    return new UUID(crypto.randomUUID());
  }
}
