import { z } from "zod";

export class UUID {
  readonly value: string;

  constructor(value: string) {
    if (!UUID.isValid(value)) {
      throw new Error("Invalid UUID");
    }
    this.value = value;
  }

  equals(other: UUID): boolean {
    return this.value === other.value;
  }

  static isValid(value: string): boolean {
    return z.string().uuid().safeParse(value).success;
  }
}
