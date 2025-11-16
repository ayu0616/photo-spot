// src/domain/common/value-object/optional-number.ts

export class OptionalNumber {
  readonly value: number | null;

  constructor(value: number | null) {
    this.value = value;
  }

  equals(other: OptionalNumber): boolean {
    return this.value === other.value;
  }
}
