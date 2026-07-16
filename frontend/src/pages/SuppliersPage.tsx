import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import DataTable from '@/components/ui/DataTable'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { showToast } from '@/components/ui/Toast'
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '@/hooks/api/useSuppliers'
import { useAuthStore } from '@/stores/auth'
import type { Supplier } from '@/types'

const emptyForm = { name: '', tax_id: '', email: '', phone: '', address: '', contact_person: '', active: true }

export default function SuppliersPage() {
  const user = useAuthStore((s) => s.user)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)

  const { data, isLoading } = useSuppliers({ page, search, per_page: 20 })
  const createMut = useCreateSupplier()
  const updateMut = useUpdateSupplier(editId!)
  const deleteMut = useDeleteSupplier()

  const canEdit = user?.role === 'admin' || user?.role === 'manager'

  const openCreate = () => {
    setForm(emptyForm)
    setEditId(null)
    setModalOpen(true)
  }

  const openEdit = (supplier: Supplier) => {
    setForm({
      name: supplier.name,
      tax_id: supplier.tax_id,
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      contact_person: supplier.contact_person || '',
      active: supplier.active,
    })
    setEditId(supplier.id)
    setModalOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editId) {
        await updateMut.mutateAsync(form)
        showToast('success', 'Supplier updated')
      } else {
        await createMut.mutateAsync(form)
        showToast('success', 'Supplier created')
      }
      setModalOpen(false)
    } catch {
      showToast('error', 'Failed to save supplier')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMut.mutateAsync(deleteId)
      setDeleteId(null)
      showToast('success', 'Supplier deleted')
    } catch {
      showToast('error', 'Failed to delete supplier')
    }
  }

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'tax_id', label: 'Tax ID' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'contact_person', label: 'Contact' },
    {
      key: 'active',
      label: 'Status',
      render: (row: Supplier) => (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
          row.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {row.active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    ...(canEdit ? [{
      key: 'actions' as const,
      label: '',
      render: (row: Supplier) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="rounded p-1 text-gray-400 hover:bg-gray-100">
            <Pencil className="h-4 w-4" />
          </button>
          {user?.role === 'admin' && (
            <button onClick={() => setDeleteId(row.id)} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    }] : []),
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-sm text-gray-500">Manage suppliers and vendors</p>
        </div>
        {canEdit && (
          <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            <Plus className="h-4 w-4" /> New Supplier
          </button>
        )}
      </div>

      <DataTable columns={columns} data={data?.data ?? []} total={data?.total ?? 0}
        page={page} onPageChange={setPage} onSearch={setSearch} loading={isLoading} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Supplier' : 'New Supplier'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tax ID *</label>
            <input required value={form.tax_id} onChange={(e) => setForm({...form, tax_id: e.target.value})}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} rows={2}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Person</label>
            <input value={form.contact_person} onChange={(e) => setForm({...form, contact_person: e.target.value})}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({...form, active: e.target.checked})}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            Active
          </label>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">
              Save
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Supplier" message="Are you sure? This action cannot be undone."
        loading={deleteMut.isPending} />
    </div>
  )
}
