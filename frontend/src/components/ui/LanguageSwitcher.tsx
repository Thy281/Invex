import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/stores/settings'
import { Languages } from 'lucide-react'

const languages = [
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'es', label: 'Español' },
  { code: 'zh', label: '中文' },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const setLanguage = useSettingsStore((s) => s.setLanguage)

  const handleChange = (code: string) => {
    i18n.changeLanguage(code)
    setLanguage(code)
  }

  return (
    <div className="relative inline-block">
      <select
        value={i18n.language?.split('-')[0] || 'en'}
        onChange={(e) => handleChange(e.target.value)}
        className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-8 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
      <Languages className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
    </div>
  )
}

export function LanguageToggle() {
  const { i18n } = useTranslation()
  const setLanguage = useSettingsStore((s) => s.setLanguage)
  const current = i18n.language?.split('-')[0] || 'en'

  const handleChange = (code: string) => {
    i18n.changeLanguage(code)
    setLanguage(code)
  }

  return (
    <button
      onClick={() => {
        const codes = ['en', 'pt', 'es', 'zh']
        const idx = codes.indexOf(current)
        handleChange(codes[(idx + 1) % codes.length])
      }}
      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
      title="Change language"
    >
      <Languages className="h-5 w-5" />
    </button>
  )
}
