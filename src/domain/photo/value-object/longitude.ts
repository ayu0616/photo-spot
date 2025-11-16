// src/domain/photo/value-object/longitude.ts

export class Longitude {
  readonly value: string | null;

  constructor(value: string | null) {
    this.value = value;
  }

  equals(other: Longitude): boolean {
    return this.value === other.value;
  }
}
