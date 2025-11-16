// src/domain/photo/value-object/iso.ts

export class Iso {
  readonly value: number | null;

  constructor(value: number | null) {
    this.value = value;
  }

  equals(other: Iso): boolean {
    return this.value === other.value;
  }
}
