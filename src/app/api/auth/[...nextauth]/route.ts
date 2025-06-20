
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongoClient"; 
import { ROLES, ROOT_EMAIL, type UserRole } from "@/config/roles";
import { ObjectId } from 'mongodb'; // Import ObjectId

// Define a more specific type for user documents in your DB
interface AppUser extends NextAuthUser {
  _id: ObjectId; // Ensure _id is ObjectId for querying
  role?: UserRole;
}

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
        session.user.id = token.sub; // token.sub is the user's ID from the JWT

        if (session.user.email === ROOT_EMAIL) {
          session.user.role = ROLES.ROOT;
        } else {
          try {
            const client = await clientPromise;
            const db = client.db();
            
            // Use the AppUser type for fetching
            // token.sub should be the string representation of the ObjectId
            const userFromDb = await db.collection<AppUser>('users').findOne({ _id: new ObjectId(token.sub) });

            if (userFromDb && userFromDb.role === ROLES.ADMIN) {
              session.user.role = ROLES.ADMIN;
            } else {
              // If not ROOT (by email) and not ADMIN (from DB), then default to USER
              // This also covers cases where userFromDb.role is ROLES.USER or undefined
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
    async jwt({ token, user }) { 
      // When a user signs in, the `user` object is available.
      // We want to ensure the `token.sub` (subject, which NextAuth uses for user ID in JWT)
      // is the actual database ID of the user.
      if (user?.id) { 
        token.sub = user.id; // user.id from the adapter is typically the string form of _id
      }
      // The 'role' is not added to JWT here; it's fetched fresh in the session callback for accuracy.
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
