import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { showToast } from '@/components/ui/Toast'
import { useLocations, useCreateLocation, useUpdateLocation, useDeleteLocation } from '@/hooks/api/useLocations'
import { useAuthStore } from '@/stores/auth'
import type { Location } from '@/types'

const emptyForm = { name: '', code: '', address: '', active: true }

export default function LocationsPage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const { data, isLoading } = useLocations({ page, search, per_page: 20 })
  const createMut = useCreateLocation()
  const updateMut = useUpdateLocation(editId!)
  const deleteMut = useDeleteLocation()

  const canEdit = user?.role === 'admin' || user?.role === 'manager'

  const openCreate = () => { setForm(emptyForm); setEditId(null); setModalOpen(true) }

  const openEdit = (loc: Location) => {
    setForm({ name: loc.name, code: loc.code, address: loc.address || '', active: loc.active })
    setEditId(loc.id); setModalOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editId) { await updateMut.mutateAsync(form); showToast('success', t('locations.title') + ' ' + t('common.updated')) }
      else { await createMut.mutateAsync(form); showToast('success', t('locations.title') + ' ' + t('common.created')) }
      setModalOpen(false)
    } catch { showToast('error', t('common.failedToSave') + ' ' + t('locations.title').toLowerCase()) }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try { await deleteMut.mutateAsync(deleteId); setDeleteId(null); showToast('success', t('locations.title') + ' ' + t('common.deleted')) }
    catch { showToast('error', t('common.failedToDelete') + ' ' + t('locations.title').toLowerCase()) }
  }

  const columns = [
    { key: 'name', label: t('locations.name'), sortable: true },
    { key: 'code', label: t('locations.code') },
    { key: 'address', label: t('locations.address') },
    {
      key: 'active', label: t('locations.status'),
      render: (row: Location) => (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
          row.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`        }>{row.active ? t('common.active') : t('common.inactive')}</span>
      ),
    },
    ...(canEdit ? [{
      key: 'actions' as const, label: '',
      render: (row: Location) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="rounded p-1 text-gray-400 hover:bg-gray-100"><Pencil className="h-4 w-4" /></button>
          {user?.role === 'admin' && (
            <button onClick={() => setDeleteId(row.id)} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
          )}
        </div>
      ),
    }] : []),
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">{t('locations.title')}</h1><p className="text-sm text-gray-500">{t('locations.subtitle')}</p></div>
        {canEdit && (
          <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            <Plus className="h-4 w-4" /> {t('locations.newLocation')}
          </button>
        )}
      </div>

      <DataTable columns={columns} data={data?.data ?? []} total={data?.total ?? 0}
        page={page} onPageChange={setPage} onSearch={setSearch} loading={isLoading} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? t('locations.editLocation') : t('locations.newLocation')}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('locations.name')} *</label>
            <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('locations.code')} *</label>
            <input required value={form.code} onChange={(e) => setForm({...form, code: e.target.value})}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('locations.address')}</label>
            <textarea value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} rows={2}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({...form, active: e.target.checked})}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" /> {t('common.active')}
          </label>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">{t('common.cancel')}</button>
            <button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">{t('common.save')}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title={t('locations.deleteTitle')} message={t('locations.deleteMessage')} loading={deleteMut.isPending} />
    </div>
  )
}
