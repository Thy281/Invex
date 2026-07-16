import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState, LoginResponse } from '@/types/auth'
import { useSettingsStore } from './settings'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (res: LoginResponse) => {
        if (res.user.theme) {
          useSettingsStore.getState().setTheme(res.user.theme as 'light' | 'dark' | 'system')
        }
        set({
          user: res.user,
          accessToken: res.access_token,
          refreshToken: res.refresh_token,
          isAuthenticated: true,
        })
      },

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      setUser: (user) => {
        if (user.theme) {
          useSettingsStore.getState().setTheme(user.theme as 'light' | 'dark' | 'system')
        }
        set({ user })
      },
    }),
    { name: 'invex-auth' },
  ),
)
