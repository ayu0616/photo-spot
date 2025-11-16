// src/domain/photo/value-object/lens-make.ts

export class LensMake {
  readonly value: string | null;

  constructor(value: string | null) {
    this.value = value;
  }

  equals(other: LensMake): boolean {
    return this.value === other.value;
  }
}
