// src/domain/photo/photo-url/photo-url.ts

import { z } from "zod";

export class PhotoUrl {
  readonly value: string;

  constructor(value: string) {
    if (!PhotoUrl.isValid(value)) {
      throw new Error("Invalid PhotoUrl");
    }
    this.value = value;
  }

  equals(other: PhotoUrl): boolean {
    return this.value === other.value;
  }

  static isValid(value: string): boolean {
    return z.string().url().safeParse(value).success;
  }
}
