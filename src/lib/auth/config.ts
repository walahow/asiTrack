import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "user" | "admin" | "super_admin";
        session.user.username = token.username as string;
      }
      return session;
    },
    authorized() {
      return true; // Let middleware.ts handle all routing logic
    },
  },
  providers: [], // Empty array by default, will be populated in src/auth.ts
} satisfies NextAuthConfig;
