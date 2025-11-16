// src/domain/common/value-object/url.ts

import { z } from "zod";

export class Url {
  readonly value: string;

  constructor(value: string) {
    if (!Url.isValid(value)) {
      throw new Error("Invalid URL");
    }
    this.value = value;
  }

  equals(other: Url): boolean {
    return this.value === other.value;
  }

  static isValid(value: string): boolean {
    return z.string().url().safeParse(value).success;
  }
}
