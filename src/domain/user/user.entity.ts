// src/domain/user/user.entity.ts

import type { EmailVerified } from "./value-object/email-verified";
import type { UserEmail } from "./value-object/user-email";
import type { UserId } from "./value-object/user-id";
import type { UserImage } from "./value-object/user-image";
import type { UserName } from "./value-object/user-name";

export class UserEntity {
  readonly id: UserId;
  name: UserName | null;
  email: UserEmail | null;
  emailVerified: EmailVerified | null;
  image: UserImage | null;

  constructor(
    id: UserId,
    name: UserName | null,
    email: UserEmail | null,
    emailVerified: EmailVerified | null,
    image: UserImage | null,
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.emailVerified = emailVerified;
    this.image = image;
  }

  equals(other: UserEntity): boolean {
    return this.id.equals(other.id);
  }

  updateName(name: UserName | null): void {
    this.name = name;
  }

  updateEmail(email: UserEmail | null): void {
    this.email = email;
  }

  updateEmailVerified(emailVerified: EmailVerified | null): void {
    this.emailVerified = emailVerified;
  }

  updateImage(image: UserImage | null): void {
    this.image = image;
  }
}
