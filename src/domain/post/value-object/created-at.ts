// src/domain/post/value-object/created-at.ts

export class CreatedAt {
  readonly value: Date;

  constructor(value: Date) {
    this.value = value;
  }

  equals(other: CreatedAt): boolean {
    return this.value.getTime() === other.value.getTime();
  }
}
