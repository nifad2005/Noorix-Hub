
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongoClient"; // Use the new MongoClient promise

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
        session.user.id = token.sub; // token.sub is the user id from the database via JWT
      }
      // You can add other properties from the token to the session here if needed
      // For example, if you store accessToken in the token:
      // if (token.accessToken && session.user) {
      //   (session.user as any).accessToken = token.accessToken;
      // }
      return session;
    },
    async jwt({ token, user, account }) {
      // Initial sign in or when account is present
      if (account && user) {
        // `user` object here will have `id` from the MongoDB adapter
        return {
          ...token,
          id: user.id, // Persist the user id from the database into the token
          // accessToken: account.access_token, // Optionally store access token
          // refreshToken: account.refresh_token, // Optionally store refresh token
        };
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
