import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    accessToken: string
    refreshToken: string
    user: {
      id: string
      email: string
      name: string
      firstName: string
      lastName: string
      phoneNumber: string
      userType: string
      isActive: boolean
    }
  }

  interface User {
    id: string
    email: string
    name: string
    firstName: string
    lastName: string
    phoneNumber: string
    userType: string
    isActive: boolean
    accessToken: string
    refreshToken: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string
    refreshToken: string
    userType: string
    firstName: string
    lastName: string
    phoneNumber: string
    isActive: boolean
  }
}