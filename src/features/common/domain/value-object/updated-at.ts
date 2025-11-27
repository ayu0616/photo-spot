import { DateTime } from "./date-time";

export class UpdatedAt extends DateTime {
  static create(): UpdatedAt {
    return new UpdatedAt(new Date());
  }
}
