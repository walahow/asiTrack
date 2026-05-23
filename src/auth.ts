import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth/config";
import { dbConnect } from "@/lib/db/mongoose";
import User from "@/models/User";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Credentials({
      id: "user-credentials",
      name: "User Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        await dbConnect();
        const username = (credentials.username as string).toLowerCase().trim();
        const user = await User.findOne({ username });
        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.nama_lengkap,
          username: user.username,
          role: "user",
        };
      },
    }),
    Credentials({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        await dbConnect();
        const username = (credentials.username as string).toLowerCase().trim();
        const admin = await Admin.findOne({ username });
        if (!admin || !admin.password) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password as string, admin.password);
        if (!isValid) {
          return null;
        }

        return {
          id: admin._id.toString(),
          name: admin.username,
          username: admin.username,
          role: admin.role,
        };
      },
    }),
  ],
});
