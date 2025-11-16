// src/domain/photo/value-object/orientation.ts

export class Orientation {
  readonly value: number | null;

  constructor(value: number | null) {
    this.value = value;
  }

  equals(other: Orientation): boolean {
    return this.value === other.value;
  }
}
