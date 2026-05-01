import NextAuth from 'next-auth'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import Resend from 'next-auth/providers/resend'
import { db } from '@/lib/db/client'
import { users, accounts, verificationTokens } from '@/lib/db/schema'
import { getActiveSubscription } from '@/lib/db/queries'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    verificationTokensTable: verificationTokens,
  }),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM ?? 'noreply@complypic.com',
    }),
  ],
  pages: {
    signIn: '/signin',
    verifyRequest: '/verify',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id
        const sub = await getActiveSubscription(user.id)
        token.plan = sub?.plan ?? 'free'
        token.creditsRemaining = sub?.imageCreditsRemaining ?? 0
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string
        session.user.plan = token.plan as string
        session.user.creditsRemaining = token.creditsRemaining as number
      }
      return session
    },
  },
})
