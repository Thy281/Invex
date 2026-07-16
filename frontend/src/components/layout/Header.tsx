import { useTranslation } from 'react-i18next'
import { Bell } from 'lucide-react'
import { useWSStore } from '@/stores/websocket'
import { LanguageToggle } from '@/components/ui/LanguageSwitcher'

export default function Header() {
  const { t } = useTranslation()
  const wsConnected = useWSStore((s) => s.connected)

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">{t('header.subtitle')}</span>
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            wsConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
          title={wsConnected ? t('header.connected') : t('header.disconnected')}
        />
      </div>

      <div className="flex items-center gap-4">
        <LanguageToggle />
        <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            0
          </span>
        </button>
      </div>
    </header>
  )
}
