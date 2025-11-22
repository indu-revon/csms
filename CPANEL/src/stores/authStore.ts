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
        try {
          // Import apiClient dynamically to avoid circular dependency
          const { apiClient } = await import('../services/apiClient')

          const response = await apiClient.post<{ access_token: string }>('/auth/login', {
            email,
            password,
          })

          const token = response.access_token

          // Decode token to get user info (simple decode for now, or fetch user profile)
          // For now, we'll construct the user object from the email and a default role
          // In a real app, you'd decode the JWT or fetch /auth/me
          const user: User = {
            id: '1', // Placeholder, ideally comes from token/profile
            email,
            name: 'Admin User', // Placeholder
            role: 'SUPER_ADMIN',
          }

          set({
            user,
            token,
            isAuthenticated: true,
          })
        } catch (error) {
          console.error('Login failed:', error)
          throw error
        }
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
