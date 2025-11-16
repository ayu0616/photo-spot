export abstract class ValueObject<T extends string | number | boolean | Date> {
  protected constructor(protected readonly _value: T) {}

  public get value(): T {
    return this._value;
  }
}
