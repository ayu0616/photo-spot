export class StringValue {
  private readonly _value: string;

  constructor(value: string) {
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  equals(other: StringValue): boolean {
    return this._value === other.value;
  }
}
