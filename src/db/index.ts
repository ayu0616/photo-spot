import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export const db = drizzle({
  schema,
  connection: process.env.DATABASE_URL,
  logger: true,
});
