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
  callbacks: {
    async session({ session, token: { sub } }) {
      if (session.user && sub) session.user.id = sub;
      return session;
    },
  },
} as const satisfies NextAuthConfig;

export const nextAuth = NextAuth(nextAuthConfig);

declare module "next-auth" {
  interface Session {
    user: {
      id: string | null;
    };
  }
}
