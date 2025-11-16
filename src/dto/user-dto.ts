// src/dto/user-dto.ts

import { z } from "zod";
import { UserEntity } from "../domain/user/user.entity";
import { EmailVerified } from "../domain/user/value-object/email-verified";
import { UserEmail } from "../domain/user/value-object/user-email";
import { UserId } from "../domain/user/value-object/user-id";
import { UserImage } from "../domain/user/value-object/user-image";
import { UserName } from "../domain/user/value-object/user-name";

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
      name: entity.name ? entity.name.value : null,
      email: entity.email ? entity.email.value : null,
      emailVerified: entity.emailVerified ? entity.emailVerified.value : null,
      image: entity.image ? entity.image.value : null,
    };
  },

  toEntity(dto: UserDto): UserEntity {
    const id = new UserId(dto.id);
    const name = dto.name ? new UserName(dto.name) : null;
    const email = dto.email ? new UserEmail(dto.email) : null;
    const emailVerified = dto.emailVerified
      ? new EmailVerified(dto.emailVerified)
      : null;
    const image = dto.image ? new UserImage(dto.image) : null;
    return new UserEntity(id, name, email, emailVerified, image);
  },
};
