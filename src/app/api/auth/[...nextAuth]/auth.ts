import type { AuthConfig } from "@auth/core";
import Google from "@auth/core/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth, { type NextAuthConfig } from "next-auth";
import { db } from "@/db";
import {
  accountsTable,
  authenticatorsTable,
  sessionsTable,
  usersTable,
  verificationTokensTable,
} from "@/db/schema";

export const nextAuthConfig = {
  adapter: DrizzleAdapter(db, {
    usersTable: usersTable,
    accountsTable: accountsTable,
    authenticatorsTable: authenticatorsTable,
    sessionsTable: sessionsTable,
    verificationTokensTable: verificationTokensTable,
  }),
  secret: process.env.AUTH_SECRET,
  providers: [Google],
  session: { strategy: "jwt" },
} as const satisfies NextAuthConfig | AuthConfig;

export const nextAuth = NextAuth(nextAuthConfig);
