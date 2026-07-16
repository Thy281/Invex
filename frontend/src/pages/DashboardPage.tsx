import { Package, AlertTriangle, TrendingDown, DollarSign, ClipboardList } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
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
      label: 'Total Products',
      value: data?.total_products ?? 0,
      icon: Package,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      label: 'Low Stock',
      value: data?.low_stock_count ?? 0,
      icon: AlertTriangle,
      color: 'text-yellow-600 bg-yellow-100',
    },
    {
      label: 'Out of Stock',
      value: data?.out_of_stock_count ?? 0,
      icon: TrendingDown,
      color: 'text-red-600 bg-red-100',
    },
    {
      label: 'Inventory Value',
      value: `$${Number(data?.inventory_value ?? 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600 bg-green-100',
    },
    {
      label: 'Pending POs',
      value: data?.pending_pos ?? 0,
      icon: ClipboardList,
      color: 'text-purple-600 bg-purple-100',
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className={`rounded-lg p-2 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Movements</h2>
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : (
            <div className="space-y-3">
              {(data?.recent_movements ?? []).slice(0, 5).map((m: any) => (
                <div key={m.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{m.product_name}</p>
                    <p className="text-xs text-gray-500">{m.type} - {m.reason}</p>
                  </div>
                  <span className="text-sm font-medium">{Number(m.quantity).toFixed(2)}</span>
                </div>
              ))}
              {(data?.recent_movements ?? []).length === 0 && (
                <p className="text-sm text-gray-400">No movements yet</p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Alerts</h2>
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : (
            <div className="space-y-3">
              {(data?.recent_alerts ?? []).slice(0, 5).map((a: any) => (
                <div key={a.id} className="flex items-center gap-3 border-b pb-2 last:border-0">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-700">{a.message}</p>
                    <p className="text-xs text-gray-400">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {(data?.recent_alerts ?? []).length === 0 && (
                <p className="text-sm text-gray-400">No alerts</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
