// src/types/next-auth.d.ts
import NextAuth from "next-auth";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `auth`, contains information about the active session.
   */
  interface Session {
    user: {
      /** The user's role (ADMIN or TENANT) */
      id: string;
      role: string;
      image?: string | null;
    } & DefaultSession["user"];
  }

  /** The OAuth profile returned from your provider */
  interface User extends DefaultUser {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    role?: string;
  }
}