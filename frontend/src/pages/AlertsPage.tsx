import { useTranslation } from 'react-i18next'

export default function AlertsPage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('alerts.title')}</h1>
      <p className="text-gray-500">{t('alerts.loading')}</p>
    </div>
  )
}
