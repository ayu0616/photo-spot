// src/domain/common/value-object/optional-string.ts

export class OptionalString {
  readonly value: string | null;

  constructor(value: string | null) {
    this.value = value;
  }

  equals(other: OptionalString): boolean {
    return this.value === other.value;
  }
}
