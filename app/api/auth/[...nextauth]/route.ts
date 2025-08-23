import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        phone_number: { label: 'Phone Number', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials) return null

        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'
          
          // Determine login endpoint based on whether email or phone is provided
          const loginUrl = credentials.email 
            ? `${apiUrl}/auth/login/`
            : `${apiUrl}/auth/phone-login/`

          const body = credentials.email
            ? { email: credentials.email, password: credentials.password }
            : { phone_number: credentials.phone_number, password: credentials.password }

          const response = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error('Login error:', errorData)
            throw new Error(errorData.detail || errorData.message || 'Invalid credentials')
          }

          const data = await response.json()
          
          if (!data.user.is_active) {
            throw new Error('User account is inactive')
          }

          return {
            id: data.user.id,
            email: data.user.email,
            name: `${data.user.first_name} ${data.user.last_name}`,
            firstName: data.user.first_name,
            lastName: data.user.last_name,
            phoneNumber: data.user.phone_number,
            userType: data.user.user_type,
            isActive: data.user.is_active,
            accessToken: data.access,
            refreshToken: data.refresh,
          }
        } catch (error: any) {
          console.error('Authentication error:', error.message)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.userType = user.userType
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.phoneNumber = user.phoneNumber
        token.isActive = user.isActive
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.refreshToken = token.refreshToken as string
      session.user.userType = token.userType as string
      session.user.firstName = token.firstName as string
      session.user.lastName = token.lastName as string
      session.user.phoneNumber = token.phoneNumber as string
      session.user.isActive = token.isActive as boolean
      session.user.id = token.sub as string
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  events: {
    async signOut() {
      // Clear any additional client-side storage if needed
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here',
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }