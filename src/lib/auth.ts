import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import db from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      
      const existingUser = await db.prepare("SELECT * FROM users WHERE email = ?").get(user.email) as { id: string } | undefined;
      
      if (!existingUser) {
        const id = user.id || uuidv4();
        await db.prepare("INSERT INTO users (id, email, name) VALUES (?, ?, ?)").run(
          id,
          user.email,
          user.name || "User"
        );
      }
      return true;
    },
    async session({ session }) {
      if (session?.user?.email) {
        const dbUser = await db.prepare("SELECT * FROM users WHERE email = ?").get(session.user.email) as { id: string } | undefined;
        if (dbUser) {
          (session.user as any).id = dbUser.id;
          
          const sub = await db.prepare("SELECT * FROM subscriptions WHERE userId = ? AND status = 'active'").get(dbUser.id);
          (session as any).isPro = !!sub;
        }
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
