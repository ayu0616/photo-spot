// src/domain/user/value-object/user-image.ts

import { Url } from "../../common/value-object/url";
import { OptionalString } from "../../common/value-object/optional-string";

export class UserImage extends OptionalString {
  constructor(value: string | null) {
    super(value);
    if (value !== null && !Url.isValid(value)) {
      throw new Error("Invalid UserImage URL");
    }
  }
}
