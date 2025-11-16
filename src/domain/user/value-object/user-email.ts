// src/domain/user/value-object/user-email.ts

import { z } from "zod";
import { StringValue } from "../../common/value-object/string";

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
