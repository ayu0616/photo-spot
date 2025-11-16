// src/domain/photo/value-object/focal-length-35mm.ts

export class FocalLength35mm {
  readonly value: string | null;

  constructor(value: string | null) {
    this.value = value;
  }

  equals(other: FocalLength35mm): boolean {
    return this.value === other.value;
  }
}
