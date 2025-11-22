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
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
} as const satisfies NextAuthConfig;

export const nextAuth = NextAuth(nextAuthConfig);

export const { handlers, signIn, signOut, auth } = nextAuth;

import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string | null;
      role?: string;
    };
  }
  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}
