export class DateTime {
  readonly value: Date;

  constructor(value: Date) {
    this.value = value;
  }

  equals(other: DateTime): boolean {
    return this.value.getTime() === other.value.getTime();
  }
}
