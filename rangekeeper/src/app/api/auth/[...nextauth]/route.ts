/**
 * NextAuth.js Route Handler
 *
 * Handles all authentication flows: sign in, sign out, session, callbacks.
 * Supports Google OAuth + Email/Password (credentials) providers.
 *
 * Docs: https://next-auth.js.org/configuration/initialization#route-handlers-app
 */

import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  // Use Prisma as the session/user store
  adapter: PrismaAdapter(db) as NextAuthOptions['adapter'],

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // Request offline access so we can refresh tokens
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),

    // TODO: Add Microsoft/Azure AD provider for institutions using M365
    // TODO: Add Canvas OAuth2 provider once Canvas OAuth app is approved
  ],

  session: {
    strategy: 'database',
    // Sessions expire after 30 days of inactivity
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  callbacks: {
    /**
     * Fires on every session read. Attach the user's DB id to the session
     * so we can look them up in API routes without an extra query.
     */
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },

    /**
     * TODO: On first sign-in, create the student's profile record and
     * trigger an initial Canvas LMS sync if they've connected their account.
     */
    async signIn({ user, account }) {
      if (!user.email) return false;
      // TODO: Log sign-in event for audit trail
      return true;
    },
  },

  events: {
    /**
     * TODO: When a new user is created, send a welcome SMS via Twilio
     * and enqueue an initial Canvas sync job.
     */
    async createUser({ user }) {
      // queue.add('welcome', { userId: user.id });
    },
  },

  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
