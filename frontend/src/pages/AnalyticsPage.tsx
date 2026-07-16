import { useTranslation } from 'react-i18next'

export default function AnalyticsPage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('analytics.title')}</h1>
      <p className="text-gray-500">{t('analytics.loading')}</p>
    </div>
  )
}
