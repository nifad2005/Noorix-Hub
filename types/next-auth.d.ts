
import type { UserRole } from '@/config/roles'; // New import
import 'next-auth';
import type { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user?: {
      id?: string | null; // Add your custom property id
      role?: UserRole; // Add role
    } & DefaultSession['user']; // Keep the default properties
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User extends DefaultUser {
    role?: UserRole; // Add role (this will be manually set in the DB for ADMINs)
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id?: string; // Corresponds to token.sub which will be user's DB id
    role?: UserRole; // Add role
    // accessToken?: string; // Example if you store accessToken
  }
}
