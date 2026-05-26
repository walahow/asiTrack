import NextAuth from "next-auth";
import { authConfig } from "./src/lib/auth/config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isUserPage =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/form") ||
    pathname.startsWith("/pojok-baca") ||
    pathname.startsWith("/video") ||
    pathname.startsWith("/onboarding");

  const isAdminPage = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  const isSuperAdminPage = pathname.startsWith("/admin/admins");

  // --- ADMIN ROUTE PROTECTION (runs before any redirect) ---

  // Super Admin route protection
  if (isSuperAdminPage) {
    if (!isLoggedIn || req.auth?.user?.role !== "super_admin") {
      return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
    }
  }

  // Admin route protection (catches /admin, /admin/dashboard, /admin/artikel, etc.)
  if (isAdminPage) {
    if (!isLoggedIn || (req.auth?.user?.role !== "admin" && req.auth?.user?.role !== "super_admin")) {
      return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
    }
    // Redirect bare /admin to /admin/dashboard only after auth is confirmed
    if (pathname === "/admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.nextUrl));
    }
  }

  // --- USER ROUTE PROTECTION ---
  if (isUserPage) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/login", req.nextUrl));
    }
    // Prevent admins from accessing user dashboard (send them to admin portal)
    if (req.auth?.user?.role === "admin" || req.auth?.user?.role === "super_admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.nextUrl));
    }
  }

  // Authenticated users trying to access public/login pages
  if (isLoggedIn && (pathname === "/" || pathname === "/auth/login" || pathname === "/auth/signup")) {
    if (req.auth?.user?.role === "admin" || req.auth?.user?.role === "super_admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.nextUrl));
    }
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }
  if (isLoggedIn && pathname === "/admin/login") {
    if (req.auth?.user?.role === "admin" || req.auth?.user?.role === "super_admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.nextUrl));
    } else {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.png|.*\\.png).*)"],
};
