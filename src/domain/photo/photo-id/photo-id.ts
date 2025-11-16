// src/domain/photo/photo-id/photo-id.ts

import { z } from "zod";

export class PhotoId {
  readonly value: string;

  constructor(value: string) {
    if (!PhotoId.isValid(value)) {
      throw new Error("Invalid PhotoId");
    }
    this.value = value;
  }

  equals(other: PhotoId): boolean {
    return this.value === other.value;
  }

  static isValid(value: string): boolean {
    return z.string().uuid().safeParse(value).success;
  }
}
