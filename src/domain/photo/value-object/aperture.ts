// src/domain/photo/value-object/aperture.ts

export class Aperture {
  readonly value: string | null;

  constructor(value: string | null) {
    this.value = value;
  }

  equals(other: Aperture): boolean {
    return this.value === other.value;
  }
}
