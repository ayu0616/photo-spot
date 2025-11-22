export class TripDescription {
  constructor(readonly value: string | null) {
    if (value !== null && value.length > 255) {
      throw new Error("Trip description cannot be longer than 255 characters");
    }
  }

  equals(other: TripDescription): boolean {
    return this.value === other.value;
  }
}
