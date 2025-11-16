// src/domain/photo/value-object/lens-model.ts

export class LensModel {
  readonly value: string | null;

  constructor(value: string | null) {
    this.value = value;
  }

  equals(other: LensModel): boolean {
    return this.value === other.value;
  }
}
