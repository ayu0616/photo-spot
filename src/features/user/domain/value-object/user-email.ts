import { z } from "zod";
import { StringValue } from "@/features/common/domain/value-object/string";

export class UserEmail extends StringValue {
  constructor(value: string) {
    if (!UserEmail.isValid(value)) {
      throw new Error("Invalid UserEmail");
    }
    super(value);
  }

  static isValid(value: string): boolean {
    return z.string().email().safeParse(value).success;
  }
}
