// src/domain/user/user.entity.ts

import type { EmailVerified } from "./value-object/email-verified";
import type { UserEmail } from "./value-object/user-email";
import type { UserId } from "./value-object/user-id";
import type { UserName } from "./value-object/user-name";
import type { UserImage } from "./value-object/user-image";

export class UserEntity {
  readonly id: UserId;
  name: UserName;
  email: UserEmail;
  emailVerified: EmailVerified;
  image: UserImage;

  constructor(
    id: UserId,
    name: UserName,
    email: UserEmail,
    emailVerified: EmailVerified,
    image: UserImage,
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

  updateName(name: UserName): void {
    this.name = name;
  }

  updateEmail(email: UserEmail): void {
    this.email = email;
  }

  updateEmailVerified(emailVerified: EmailVerified): void {
    this.emailVerified = emailVerified;
  }

  updateImage(image: UserImage): void {
    this.image = image;
  }
}
