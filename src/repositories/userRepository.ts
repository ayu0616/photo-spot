import { eq } from "drizzle-orm";
import { injectable } from "inversify";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { UserEntity } from "@/domain/user/user.entity";
import type { IUserRepository } from "@/domain/user/user-repository.interface";
import { EmailVerified } from "@/domain/user/value-object/email-verified";
import { UserEmail } from "@/domain/user/value-object/user-email";
import { UserId } from "@/domain/user/value-object/user-id";
import { UserImage } from "@/domain/user/value-object/user-image";
import { UserName } from "@/domain/user/value-object/user-name";

@injectable()
export class UserRepository implements IUserRepository {
  public async findById(id: string): Promise<UserEntity | undefined> {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, id),
    });

    if (!user) {
      return undefined;
    }

    return new UserEntity(
      new UserId(user.id),
      user.name ? new UserName(user.name) : null,
      user.email ? new UserEmail(user.email) : null,
      user.emailVerified ? new EmailVerified(user.emailVerified) : null,
      user.image ? new UserImage(user.image) : null,
    );
  }

  public async updateName(id: string, name: string): Promise<UserEntity> {
    const [updatedUser] = await db
      .update(usersTable)
      .set({ name: name })
      .where(eq(usersTable.id, id))
      .returning();

    if (!updatedUser) {
      throw new Error("User not found or failed to update.");
    }

    return new UserEntity(
      new UserId(updatedUser.id),
      updatedUser.name ? new UserName(updatedUser.name) : null,
      updatedUser.email ? new UserEmail(updatedUser.email) : null,
      updatedUser.emailVerified
        ? new EmailVerified(updatedUser.emailVerified)
        : null,
      updatedUser.image ? new UserImage(updatedUser.image) : null,
    );
  }
}
