import { v4 as uuidv4 } from "uuid";

export class TripId {
  constructor(readonly value: string) {}

  static generate(): TripId {
    return new TripId(uuidv4());
  }

  equals(other: TripId): boolean {
    return this.value === other.value;
  }
}
