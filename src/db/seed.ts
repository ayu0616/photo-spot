import { db } from ".";
import { usersTable } from "./schema";

const seed = async () => {
  db.transaction(async (db) => {
    // delete existing data
    await db.delete(usersTable);

    const _user = await db.insert(usersTable).values({
      id: Bun.randomUUIDv7(),
      userId: "test_user_1",
      name: "テストユーザー1",
    });
  });
};

seed();
