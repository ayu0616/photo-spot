// src/domain/post/user-id/user-id.ts

import { z } from "zod";

export class UserId {
  readonly value: string;

  constructor(value: string) {
    if (!UserId.isValid(value)) {
      throw new Error("Invalid UserId");
    }
    this.value = value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  static isValid(value: string): boolean {
    return z.string().uuid().safeParse(value).success;
  }
}
