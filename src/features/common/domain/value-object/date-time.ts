export class DateTime {
  private readonly _value: Date;

  constructor(value: Date) {
    this._value = value;
  }

  get value(): Date {
    return this._value;
  }

  equals(other: DateTime): boolean {
    return this._value.getTime() === other.value.getTime();
  }
}
