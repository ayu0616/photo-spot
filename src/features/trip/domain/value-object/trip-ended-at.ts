import z from "zod";

const schema = z.string().regex(/\d{4}-\d{2}-\d{2}/);

export class TripEndedAt {
  constructor(readonly value: string) {
    if (value.length > 0 && !schema.safeParse(value).success) {
      // nullを表現するための空文字は許容する
      throw new Error("Trip endedAt is not valid");
    }
  }

  equals(other: TripEndedAt): boolean {
    return this.value === other.value;
  }
}
