import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowDownCircle, ArrowUpCircle, ArrowRightLeft, Sliders } from 'lucide-react'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import { showToast } from '@/components/ui/Toast'
import { useQuery } from '@tanstack/react-query'
import api from '@/api/client'
import { useStockIn, useStockOut, useTransfer, useAdjust } from '@/hooks/api/useMovements'
import { useProducts } from '@/hooks/api/useProducts'
import { useLocations } from '@/hooks/api/useLocations'
import type { StockMovement } from '@/types'
import { useAuthStore } from '@/stores/auth'

type MovementAction = 'in' | 'out' | 'transfer' | 'adjust'

export default function MovementsPage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const [page, setPage] = useState(1)
  const [action, setAction] = useState<MovementAction | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['movements', page],
    queryFn: async () => {
      const { data } = await api.get('/movements', { params: { page, per_page: 20 } })
      return data
    },
  })

  const stockIn = useStockIn()
  const stockOut = useStockOut()
  const transfer = useTransfer()
  const adjust = useAdjust()

  const canOperate = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'operator'

  const typeIcons: Record<string, React.ReactNode> = {
    in: <ArrowDownCircle className="h-4 w-4 text-green-500" />,
    out: <ArrowUpCircle className="h-4 w-4 text-red-500" />,
    transfer: <ArrowRightLeft className="h-4 w-4 text-blue-500" />,
    adjustment: <Sliders className="h-4 w-4 text-orange-500" />,
  }

  const columns = [
    {
      key: 'type', label: t('movements.type'),
      render: (row: StockMovement) => (
        <div className="flex items-center gap-2">
          {typeIcons[row.type]}
          <span className="capitalize">{row.type}</span>
        </div>
      ),
    },
    { key: 'product_name', label: t('movements.product') },
    { key: 'from_location_name', label: t('movements.from') },
    { key: 'to_location_name', label: t('movements.to') },
    {
      key: 'quantity', label: t('movements.qty'),
      render: (row: StockMovement) => Number(row.quantity).toFixed(3),
    },
    { key: 'reason', label: t('movements.reason') },
    { key: 'user_name', label: t('movements.by') },
    {
      key: 'created_at', label: t('movements.date'),
      render: (row: StockMovement) => new Date(row.created_at).toLocaleString(),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('movements.title')}</h1>
          <p className="text-sm text-gray-500">{t('movements.subtitle')}</p>
        </div>
        {canOperate && (
          <div className="flex gap-2">
            <MovementButton icon={<ArrowDownCircle className="h-4 w-4" />} label={t('movements.stockIn')} onClick={() => setAction('in')} />
            <MovementButton icon={<ArrowUpCircle className="h-4 w-4" />} label={t('movements.stockOut')} onClick={() => setAction('out')} />
            <MovementButton icon={<ArrowRightLeft className="h-4 w-4" />} label={t('movements.transfer')} onClick={() => setAction('transfer')} />
            {user?.role !== 'operator' && (
              <MovementButton icon={<Sliders className="h-4 w-4" />} label={t('movements.adjust')} onClick={() => setAction('adjust')} />
            )}
          </div>
        )}
      </div>

      <DataTable columns={columns} data={data?.data ?? []} total={data?.total ?? 0}
        page={page} onPageChange={setPage} loading={isLoading} />

      {action && (
        <MovementModal action={action} onClose={() => setAction(null)}
          onSave={async (payload) => {
            try {
              const mutations = { in: stockIn, out: stockOut, transfer, adjust }
              await mutations[action].mutateAsync(payload)
              const actionLabelKey = { in: 'movements.stockIn', out: 'movements.stockOut', transfer: 'movements.transfer', adjust: 'movements.adjust' }[action]
              showToast('success', t(actionLabelKey) + ' ' + t('movements.recorded'))
              setAction(null)
            } catch (e: any) {
              showToast('error', e?.response?.data?.error || t('movements.failedToProcess'))
            }
          }}
        />
      )}
    </div>
  )
}

function MovementButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
      {icon}{label}
    </button>
  )
}

function MovementModal({ action, onClose, onSave }: { action: MovementAction; onClose: () => void; onSave: (p: any) => void }) {
  const { t } = useTranslation()
  const { data: productsData } = useProducts({ per_page: 500 })
  const { data: locationsData } = useLocations({ per_page: 500 })
  const [form, setForm] = useState<any>({ product_id: '', location_id: '', from_location_id: '', to_location_id: '', quantity: 1, reason: '' })

  const products = productsData?.data ?? []
  const locations = locationsData?.data ?? []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  const title = { in: t('movements.stockIn'), out: t('movements.stockOut'), transfer: t('movements.transfer'), adjust: t('movements.adjust') }[action]

  return (
    <Modal open onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('movements.productField')} *</label>
          <select required value={form.product_id} onChange={(e) => setForm({...form, product_id: e.target.value})}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
            <option value="">{t('common.select')}</option>
            {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
          </select>
        </div>

        {(action === 'in' || action === 'out' || action === 'adjust') && (
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('movements.locationField')} *</label>
            <select required value={form.location_id} onChange={(e) => setForm({...form, location_id: e.target.value})}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="">{t('common.select')}</option>
              {locations.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        )}

        {action === 'transfer' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('movements.fromField')} *</label>
              <select required value={form.from_location_id} onChange={(e) => setForm({...form, from_location_id: e.target.value})}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                <option value="">{t('common.select')}</option>
                {locations.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('movements.toField')} *</label>
              <select required value={form.to_location_id} onChange={(e) => setForm({...form, to_location_id: e.target.value})}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                <option value="">{t('common.select')}</option>
                {locations.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>
        )}

        {(action === 'adjust') && (
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('movements.newQuantity')} *</label>
            <input type="number" step="0.001" required value={form.quantity}
              onChange={(e) => setForm({...form, quantity: e.target.value === '' ? '' : parseFloat(e.target.value)})}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
        )}

        {(action !== 'adjust') && (
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('movements.quantityField')} *</label>
            <input type="number" step="0.001" min="0.001" required value={form.quantity}
              onChange={(e) => setForm({...form, quantity: e.target.value === '' ? '' : parseFloat(e.target.value)})}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">{t('movements.reasonField')} *</label>
          <textarea required value={form.reason} onChange={(e) => setForm({...form, reason: e.target.value})} rows={2}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">{t('common.cancel')}</button>
          <button type="submit" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">{t('common.record')}</button>
        </div>
      </form>
    </Modal>
  )
}
