import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  role: 'SUPER_ADMIN' | 'OPERATOR' | 'VIEWER'
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User, token: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        // This will be implemented with actual API call
        // For now, demo authentication
        const mockUser: User = {
          id: '1',
          email,
          name: 'Admin User',
          role: 'SUPER_ADMIN',
        }
        const mockToken = 'mock-jwt-token'
        
        set({
          user: mockUser,
          token: mockToken,
          isAuthenticated: true,
        })
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },
      
      setUser: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
        })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
