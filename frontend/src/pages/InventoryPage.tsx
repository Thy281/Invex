import { useState } from 'react'
import DataTable from '@/components/ui/DataTable'
import { useQuery } from '@tanstack/react-query'
import api from '@/api/client'
import type { Inventory } from '@/types'

export default function InventoryPage() {
  const [page, setPage] = useState(1)
  const [view, setView] = useState<'by-location' | 'consolidated'>('consolidated')

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', view, page],
    queryFn: async () => {
      const { data } = await api.get('/inventory', { params: { view, page, per_page: 20 } })
      return data
    },
  })

  const columns = [
    { key: 'product_name', label: 'Product', sortable: true },
    { key: 'product_sku', label: 'SKU' },
    { key: 'location_name', label: 'Location' },
    {
      key: 'quantity',
      label: 'Quantity',
      sortable: true,
      render: (row: Inventory) => (
        <span className={Number(row.quantity) <= 0 ? 'font-medium text-red-600' : ''}>
          {Number(row.quantity).toFixed(3)}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500">View stock levels by location or consolidated</p>
        </div>
        <div className="flex rounded-lg border border-gray-300 bg-white">
          <button
            onClick={() => setView('consolidated')}
            className={`px-4 py-2 text-sm font-medium ${view === 'consolidated' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Consolidated
          </button>
          <button
            onClick={() => setView('by-location')}
            className={`px-4 py-2 text-sm font-medium ${view === 'by-location' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:text-gray-900'}`}
          >
            By Location
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        onPageChange={setPage}
        loading={isLoading}
      />
    </div>
  )
}
