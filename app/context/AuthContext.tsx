"use client"

import { createContext, useContext, ReactNode, memo } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

interface AuthContextType {
  isAuthenticated: boolean
  user: any
  login: (credentials: { email?: string; phoneNumber?: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AuthProvider = memo(({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession()

  const login = async (credentials: { email?: string; phoneNumber?: string; password: string }) => {
    try {
      const result = await signIn('credentials', {
        email: credentials.email || '',
        phone_number: credentials.phoneNumber || '',
        password: credentials.password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed')
    }
  }

  const logout = async () => {
    await signOut({ redirect: false })
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!session,
        user: session?.user || null,
        login,
        logout,
        isLoading: status === 'loading',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
});

AuthProvider.displayName = 'AuthProvider';

export { AuthProvider };
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}