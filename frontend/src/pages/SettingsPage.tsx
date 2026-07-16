import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'

export default function SettingsPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settings.title')}</h1>

      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.language')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.languageDescription')}</p>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.theme')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.themeDescription')}</p>
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </div>
  )
}
