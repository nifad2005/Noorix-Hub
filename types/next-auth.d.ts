
import 'next-auth';
import type { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user?: {
      id?: string | null; // Add your custom property id
    } & DefaultSession['user']; // Keep the default properties
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User extends DefaultUser {
    // DefaultUser already includes id, name, email, image.
    // You can add other custom properties here if your adapter/database stores them directly on the user object.
    // For example, if you add a role to your user model in MongoDB:
    // role?: string;
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    id?: string; // Corresponds to token.sub which will be user's DB id
    // accessToken?: string; // Example if you store accessToken
  }
}
