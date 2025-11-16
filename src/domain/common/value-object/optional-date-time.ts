// src/domain/common/value-object/optional-date-time.ts

export class OptionalDateTime {
  readonly value: Date | null;

  constructor(value: Date | null) {
    this.value = value;
  }

  equals(other: OptionalDateTime): boolean {
    if (this.value === null && other.value === null) {
      return true;
    }
    if (this.value === null || other.value === null) {
      return false;
    }
    return this.value.getTime() === other.value.getTime();
  }
}
