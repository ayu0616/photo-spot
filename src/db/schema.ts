import { pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: varchar({ length: 255 }).primaryKey(),
  userId: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
});
