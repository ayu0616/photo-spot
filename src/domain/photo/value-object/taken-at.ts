// src/domain/photo/value-object/taken-at.ts

export class TakenAt {
  readonly value: Date | null;

  constructor(value: Date | null) {
    this.value = value;
  }

  equals(other: TakenAt): boolean {
    if (this.value === null && other.value === null) {
      return true;
    }
    if (this.value === null || other.value === null) {
      return false;
    }
    return this.value.getTime() === other.value.getTime();
  }
}
