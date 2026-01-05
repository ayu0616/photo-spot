import type { InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { usersTable } from "@/db/schema";

export type User = InferSelectModel<typeof usersTable>;

export async function getUserById(userId: string): Promise<User | null> {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  return user ?? null;
}

export async function updateUserName(
  userId: string,
  name: string,
): Promise<User> {
  const [updatedUser] = await db
    .update(usersTable)
    .set({ name: name })
    .where(eq(usersTable.id, userId))
    .returning();

  if (!updatedUser) {
    throw new Error("User not found or failed to update.");
  }
  return updatedUser;
}
