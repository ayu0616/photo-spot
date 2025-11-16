// src/dto/user-dto.ts

import { z } from "zod";
import { UserEntity } from "../domain/user/user.entity";
import { UserId } from "../domain/user/value-object/user-id";
import { UserName } from "../domain/user/value-object/user-name";
import { UserEmail } from "../domain/user/value-object/user-email";
import { EmailVerified } from "../domain/user/value-object/email-verified";
import { UserImage } from "../domain/user/value-object/user-image";

export const UserDtoSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  emailVerified: z.date().nullable(),
  image: z.string().url().nullable(),
});

export type UserDto = z.infer<typeof UserDtoSchema>;

export const UserDtoMapper = {
  fromEntity(entity: UserEntity): UserDto {
    return {
      id: entity.id.value,
      name: entity.name.value,
      email: entity.email.value,
      emailVerified: entity.emailVerified.value,
      image: entity.image.value,
    };
  },

  toEntity(dto: UserDto): UserEntity {
    const id = new UserId(dto.id);
    const name = new UserName(dto.name);
    const email = new UserEmail(dto.email);
    const emailVerified = new EmailVerified(dto.emailVerified);
    const image = new UserImage(dto.image);
    return new UserEntity(id, name, email, emailVerified, image);
  },
};
