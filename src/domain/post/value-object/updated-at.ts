// src/domain/post/value-object/updated-at.ts

export class UpdatedAt {
  readonly value: Date;

  constructor(value: Date) {
    this.value = value;
  }

  equals(other: UpdatedAt): boolean {
    return this.value.getTime() === other.value.getTime();
  }
}
