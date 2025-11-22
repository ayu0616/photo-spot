import type { EmailVerified } from "./value-object/email-verified";
import type { UserEmail } from "./value-object/user-email";
import type { UserId } from "./value-object/user-id";
import type { UserImage } from "./value-object/user-image";
import type { UserName } from "./value-object/user-name";

export class UserEntity {
  private readonly _id: UserId;
  private _name: UserName | null;
  private _email: UserEmail | null;
  private _emailVerified: EmailVerified | null;
  private _image: UserImage | null;

  constructor(
    id: UserId,
    name: UserName | null,
    email: UserEmail | null,
    emailVerified: EmailVerified | null,
    image: UserImage | null,
  ) {
    this._id = id;
    this._name = name;
    this._email = email;
    this._emailVerified = emailVerified;
    this._image = image;
  }

  get id(): UserId {
    return this._id;
  }

  get name(): UserName | null {
    return this._name;
  }

  get email(): UserEmail | null {
    return this._email;
  }

  get emailVerified(): EmailVerified | null {
    return this._emailVerified;
  }

  get image(): UserImage | null {
    return this._image;
  }

  equals(other: UserEntity): boolean {
    return this._id.equals(other.id);
  }

  updateName(name: UserName | null): void {
    this._name = name;
  }

  updateEmail(email: UserEmail | null): void {
    this._email = email;
  }

  updateEmailVerified(emailVerified: EmailVerified | null): void {
    this._emailVerified = emailVerified;
  }

  updateImage(image: UserImage | null): void {
    this._image = image;
  }
}
