import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'
import DataTable from '@/components/ui/DataTable'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { showToast } from '@/components/ui/Toast'
import { useProducts, useDeleteProduct } from '@/hooks/api/useProducts'
import { useAuthStore } from '@/stores/auth'
import type { Product } from '@/types'

export default function ProductsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useProducts({ page, search, per_page: 20 })
  const deleteMutation = useDeleteProduct()

  const canEdit = user?.role === 'admin' || user?.role === 'manager'

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      showToast('success', 'Product deleted successfully')
      setDeleteId(null)
    } catch {
      showToast('error', 'Failed to delete product')
    }
  }

  const columns = [
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'category',
      label: 'Category',
      render: (row: Product) => row.category?.name || '-',
    },
    { key: 'unit_of_measure', label: 'Unit' },
    {
      key: 'unit_cost',
      label: 'Cost',
      render: (row: Product) => `$${Number(row.unit_cost).toFixed(2)}`,
    },
    { key: 'min_stock', label: 'Min Stock' },
    { key: 'reorder_point', label: 'Reorder' },
    {
      key: 'active',
      label: 'Status',
      render: (row: Product) => (
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
      render: (row: Product) => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/products/${row.id}/edit`)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <Pencil className="h-4 w-4" />
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={() => setDeleteId(row.id)}
              className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
            >
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
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">Manage your product catalog</p>
        </div>
        {canEdit && (
          <button
            onClick={() => navigate('/products/new')}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            New Product
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Package className="h-8 w-8 animate-pulse text-gray-300" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          total={data?.total ?? 0}
          page={page}
          onPageChange={setPage}
          onSearch={setSearch}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
