import NextAuth from "next-auth";
import { authConfig } from "./src/lib/auth/config";

export default NextAuth(authConfig).auth;

export const config = {
  // Protect all user routes, profile, forms, pojok-baca, video, onboarding, and admin routes
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.png|.*\\.png).*)"],
};
