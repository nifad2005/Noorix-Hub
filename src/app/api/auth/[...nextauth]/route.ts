
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
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
      // Add custom properties to session from token if needed
      // For example, if you store user ID in token:
      // if (token.sub && session.user) {
      //   session.user.id = token.sub;
      // }
      return session;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          // id: user.id, // If your user object from provider has an id
          // accessToken: account.access_token,
          // refreshToken: account.refresh_token,
        };
      }
      return token;
    },
  },
  pages: {
    signIn: '/login', // Redirect to custom login page
    // error: '/auth/error', // Custom error page (optional)
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
