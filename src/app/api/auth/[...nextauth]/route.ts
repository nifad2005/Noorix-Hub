
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongoClient"; // Use the new MongoClient promise
import { ROLES, ROOT_EMAIL, type UserRole } from "@/config/roles";
import type { User as DbUser } from "next-auth"; // Adapter's User type

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        // Determine role based on email for ROOT, or fetched role for others
        if (session.user.email === ROOT_EMAIL) {
          session.user.role = ROLES.ROOT;
        } else {
          // Fetch user from DB to get their role if stored
          // The 'role' field in JWT is not being set for now to always fetch fresh role from DB for ADMIN/USER
          try {
            const client = await clientPromise;
            const dbUser = await client.db().collection<DbUser>('users').findOne({ _id: new client.db().bsonLib.ObjectId(token.sub) });
            if (dbUser && (dbUser as any).role === ROLES.ADMIN) { // Check for manually set 'role' field
              session.user.role = ROLES.ADMIN;
            } else {
              session.user.role = ROLES.USER;
            }
          } catch (error) {
            console.error("Error fetching user role in session callback:", error);
            session.user.role = ROLES.USER; // Default to USER on error
          }
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Initial sign in or when account is present
      if (account && user) {
        token.id = user.id; // Persist the user id from the database into the token
        // The role can be added to the token here if desired,
        // but for ROOT role being dynamic, session callback is more reliable.
        // For ADMIN role, it would come from the user object if populated by adapter/DB.
        // Since MongoDBAdapter might not directly populate custom fields like `role` onto `user` object here,
        // we will primarily rely on the session callback to fetch and assign roles from DB.
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
    // error: '/auth/error',
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
