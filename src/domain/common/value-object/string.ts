export class StringValue {
  readonly value: string;

  constructor(value: string) {
    this.value = value;
  }

  equals(other: StringValue): boolean {
    return this.value === other.value;
  }
}
