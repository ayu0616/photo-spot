// src/domain/photo/value-object/focal-length.ts

export class FocalLength {
  readonly value: string | null;

  constructor(value: string | null) {
    this.value = value;
  }

  equals(other: FocalLength): boolean {
    return this.value === other.value;
  }
}
