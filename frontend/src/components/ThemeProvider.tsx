import { useEffect } from 'react'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((s) => s.theme)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (user?.theme && user.theme !== theme) {
      useSettingsStore.getState().setTheme(user.theme as 'light' | 'dark' | 'system')
    }
  }, [user?.theme])

  useEffect(() => {
    const root = document.documentElement

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const apply = () => root.classList.toggle('dark', mq.matches)
      apply()
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }

    root.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return children
}
