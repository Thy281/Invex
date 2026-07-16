import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'system'

interface SettingsState {
  language: string
  theme: ThemeMode
  setLanguage: (lang: string) => void
  setTheme: (theme: ThemeMode) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'en',
      theme: 'system',
      setLanguage: (language: string) => set({ language }),
      setTheme: (theme: ThemeMode) => set({ theme }),
    }),
    { name: 'invex-settings' },
  ),
)
