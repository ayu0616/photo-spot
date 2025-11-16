// src/domain/post/post-id/post-id.ts

import { z } from "zod";

export class PostId {
  readonly value: string;

  constructor(value: string) {
    if (!PostId.isValid(value)) {
      throw new Error("Invalid PostId");
    }
    this.value = value;
  }

  equals(other: PostId): boolean {
    return this.value === other.value;
  }

  static isValid(value: string): boolean {
    return z.string().uuid().safeParse(value).success;
  }
}
