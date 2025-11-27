import { DateTime } from "./date-time";

export class CreatedAt extends DateTime {
  static create(): CreatedAt {
    return new CreatedAt(new Date());
  }
}
