export class NumberValue {
  readonly value: number;

  constructor(value: number) {
    this.value = value;
  }

  equals(other: NumberValue): boolean {
    return this.value === other.value;
  }
}
