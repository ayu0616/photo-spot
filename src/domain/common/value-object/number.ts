export class NumberValue {
  private readonly _value: number;

  constructor(value: number) {
    this._value = value;
  }

  get value(): number {
    return this._value;
  }

  equals(other: NumberValue): boolean {
    return this._value === other.value;
  }
}
