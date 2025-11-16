// src/domain/user/value-object/user-email.ts

import { z } from "zod";

export class UserEmail {
  readonly value: string | null;

  constructor(value: string | null) {
    if (value !== null && !UserEmail.isValid(value)) {
      throw new Error("Invalid UserEmail");
    }
    this.value = value;
  }

  equals(other: UserEmail): boolean {
    return this.value === other.value;
  }

  static isValid(value: string): boolean {
    return z.string().email().safeParse(value).success;
  }
}
