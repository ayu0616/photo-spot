import { db } from ".";
import { usersTable } from "./schema";

const seed = async () => {
  console.log("Starting database seed...");
  db.transaction(async (db) => {
    // delete existing data
    console.log("Deleting existing user data...");
    await db.delete(usersTable);
    console.log("Existing user data deleted.");

    console.log("Inserting new user data...");
    const _user = await db.insert(usersTable).values({
      id: Bun.randomUUIDv7(),
      userId: "test_user_1",
      name: "テストユーザー1",
    });
    console.log("New user data inserted.");
  });
  console.log("Database seed completed.");
};

seed();
