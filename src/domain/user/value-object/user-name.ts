// src/domain/user/value-object/user-name.ts

export class UserName {
  readonly value: string | null;

  constructor(value: string | null) {
    this.value = value;
  }

  equals(other: UserName): boolean {
    return this.value === other.value;
  }
}
