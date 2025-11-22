export class TripTitle {
  constructor(readonly value: string) {
    if (value.length === 0) {
      throw new Error("Trip title cannot be empty");
    }
    if (value.length > 255) {
      throw new Error("Trip title cannot be longer than 255 characters");
    }
  }

  equals(other: TripTitle): boolean {
    return this.value === other.value;
  }
}
