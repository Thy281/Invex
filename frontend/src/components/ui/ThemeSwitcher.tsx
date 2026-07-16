import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import { updateProfile } from '@/api/auth'
import type { ThemeMode } from '@/stores/settings'
import { Sun, Moon, Monitor } from 'lucide-react'

const themes: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'settings.themeLight', icon: Sun },
  { value: 'dark', label: 'settings.themeDark', icon: Moon },
  { value: 'system', label: 'settings.themeSystem', icon: Monitor },
]

export function ThemeSwitcher() {
  const { t } = useTranslation()
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const handleThemeChange = async (value: ThemeMode) => {
    setTheme(value)
    if (user) {
      try {
        const updated = await updateProfile({ theme: value })
        setUser(updated)
      } catch {
        // silent — backend unavailable
      }
    }
  }

  return (
    <div className="flex gap-2">
      {themes.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => handleThemeChange(value)}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            theme === value
              ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
          }`}
        >
          <Icon className="h-4 w-4" />
          {t(label)}
        </button>
      ))}
    </div>
  )
}
