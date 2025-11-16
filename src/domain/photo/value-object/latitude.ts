// src/domain/photo/value-object/latitude.ts

export class Latitude {
  readonly value: string | null;

  constructor(value: string | null) {
    this.value = value;
  }

  equals(other: Latitude): boolean {
    return this.value === other.value;
  }
}
