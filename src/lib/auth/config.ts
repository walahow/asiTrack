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
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const isUserPage =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/form") ||
        pathname.startsWith("/pojok-baca") ||
        pathname.startsWith("/video") ||
        pathname.startsWith("/onboarding");

      const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
      const isSuperAdminPage = pathname.startsWith("/admin/admins");

      // Super Admin route protection
      if (isSuperAdminPage) {
        return isLoggedIn && auth?.user?.role === "super_admin";
      }

      // Admin route protection
      if (isAdminPage) {
        return isLoggedIn && (auth?.user?.role === "admin" || auth?.user?.role === "super_admin");
      }

      // User client app page protection
      if (isUserPage) {
        return isLoggedIn && auth?.user?.role === "user";
      }

      // Unauthenticated users attempting to access public pages (like login/signup)
      if (isLoggedIn && (pathname === "/auth/login" || pathname === "/auth/signup")) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      if (isLoggedIn && pathname === "/admin/login") {
        return Response.redirect(new URL("/admin", nextUrl));
      }

      return true;
    },
  },
  providers: [], // Empty array by default, will be populated in src/auth.ts
} satisfies NextAuthConfig;
