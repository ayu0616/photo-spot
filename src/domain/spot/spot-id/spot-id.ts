// src/domain/spot/spot-id/spot-id.ts

import { z } from "zod";

export class SpotId {
  readonly value: string;

  constructor(value: string) {
    if (!SpotId.isValid(value)) {
      throw new Error("Invalid SpotId");
    }
    this.value = value;
  }

  equals(other: SpotId): boolean {
    return this.value === other.value;
  }

  static isValid(value: string): boolean {
    // UUID format validation
    return z.string().uuid().safeParse(value).success;
  }
}
