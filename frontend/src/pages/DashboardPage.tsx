import { Package, AlertTriangle, TrendingDown, DollarSign, ClipboardList } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import api from '@/api/client'
import { useWebSocket, onEvent } from '@/hooks/useWebSocket'
import { useEffect, useState } from 'react'

interface DashboardData {
  total_products: number
  low_stock_count: number
  out_of_stock_count: number
  inventory_value: number
  pending_pos: number
  recent_movements: any[]
  recent_alerts: any[]
}

export default function DashboardPage() {
  const { t } = useTranslation()
  useWebSocket()
  const [data, setData] = useState<DashboardData | null>(null)

  const { isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard')
      setData(data)
      return data
    },
    refetchInterval: 30000,
  })

  useEffect(() => {
    const unsub1 = onEvent('stock.updated', () => {
      api.get('/dashboard').then(({ data }) => setData(data))
    })
    const unsub2 = onEvent('alert.created', () => {
      api.get('/dashboard').then(({ data }) => setData(data))
    })
    return () => { unsub1(); unsub2() }
  }, [])

  const cards = [
    {
      label: t('dashboard.totalProducts'),
      value: data?.total_products ?? 0,
      icon: Package,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      label: t('dashboard.lowStock'),
      value: data?.low_stock_count ?? 0,
      icon: AlertTriangle,
      color: 'text-yellow-600 bg-yellow-100',
    },
    {
      label: t('dashboard.outOfStock'),
      value: data?.out_of_stock_count ?? 0,
      icon: TrendingDown,
      color: 'text-red-600 bg-red-100',
    },
    {
      label: t('dashboard.inventoryValue'),
      value: `$${Number(data?.inventory_value ?? 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600 bg-green-100',
    },
    {
      label: t('dashboard.pendingPOs'),
      value: data?.pending_pos ?? 0,
      icon: ClipboardList,
      color: 'text-purple-600 bg-purple-100',
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard.title')}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div className={`rounded-lg p-2 ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="card-body">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.recentMovements')}</h2>
            {isLoading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
            ) : (
              <div className="space-y-3">
                {(data?.recent_movements ?? []).slice(0, 5).map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between border-b border-gray-200 pb-2 last:border-0 dark:border-gray-700">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{m.product_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{m.type} - {m.reason}</p>
                    </div>
                    <span className="text-sm font-medium dark:text-gray-200">{Number(m.quantity).toFixed(2)}</span>
                  </div>
                ))}
                {(data?.recent_movements ?? []).length === 0 && (
                  <p className="text-sm text-gray-400 dark:text-gray-500">{t('dashboard.noMovements')}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{t('dashboard.recentAlerts')}</h2>
            {isLoading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('common.loading')}</p>
            ) : (
              <div className="space-y-3">
                {(data?.recent_alerts ?? []).slice(0, 5).map((a: any) => (
                  <div key={a.id} className="flex items-center gap-3 border-b border-gray-200 pb-2 last:border-0 dark:border-gray-700">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{a.message}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(a.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {(data?.recent_alerts ?? []).length === 0 && (
                  <p className="text-sm text-gray-400 dark:text-gray-500">{t('dashboard.noAlerts')}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
