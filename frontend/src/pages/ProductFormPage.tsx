import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useProduct, useCreateProduct, useUpdateProduct } from '@/hooks/api/useProducts'
import { useCategories } from '@/hooks/api/useCategories'
import { useSuppliers } from '@/hooks/api/useSuppliers'
import { showToast } from '@/components/ui/Toast'
import type { ProductForm } from '@/types/product'

export default function ProductFormPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: product } = useProduct(id!)
  const { data: categoriesData } = useCategories()
  const { data: suppliersData } = useSuppliers({ per_page: 200 })

  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct(id!)

  const [form, setForm] = useState<ProductForm>({
    name: '',
    sku: '',
    internal_code: '',
    description: '',
    category_id: '',
    unit_of_measure: 'unit',
    min_stock: 0,
    reorder_point: 0,
    max_stock: 0,
    unit_cost: 0,
    active: true,
  })

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        sku: product.sku,
        internal_code: product.internal_code || '',
        description: product.description || '',
        category_id: product.category_id,
        unit_of_measure: product.unit_of_measure,
        min_stock: product.min_stock,
        reorder_point: product.reorder_point,
        max_stock: product.max_stock,
        unit_cost: product.unit_cost,
        primary_supplier_id: product.primary_supplier_id,
        active: product.active,
      })
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(form)
        showToast('success', t('products.title') + ' ' + t('common.updated'))
      } else {
        await createMutation.mutateAsync(form)
        showToast('success', t('products.title') + ' ' + t('common.created'))
      }
      navigate('/products')
    } catch {
      showToast('error', t('common.failedToSave') + ' ' + t('products.title').toLowerCase())
    }
  }

  const categories = categoriesData?.data ?? []
  const suppliers = suppliersData?.data ?? []

  const loading = createMutation.isPending || updateMutation.isPending

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/products')} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? t('products.editProduct') : t('products.newProduct')}</h1>
          <p className="text-sm text-gray-500">{isEdit ? t('products.editProductSub') : t('products.newProductSub')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">{t('products.name')} *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('products.sku')} *</label>
            <input
              required
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('products.internalCode')}</label>
            <input
              value={form.internal_code}
              onChange={(e) => setForm({ ...form, internal_code: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">{t('products.description')}</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('products.category')} *</label>
            <select
              required
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">{t('common.select')}</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('products.unitOfMeasure')} *</label>
            <select
              required
              value={form.unit_of_measure}
              onChange={(e) => setForm({ ...form, unit_of_measure: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="unit">{t('products.units.unit')}</option>
              <option value="kg">{t('products.units.kg')}</option>
              <option value="g">{t('products.units.g')}</option>
              <option value="l">{t('products.units.l')}</option>
              <option value="ml">{t('products.units.ml')}</option>
              <option value="m">{t('products.units.m')}</option>
              <option value="box">{t('products.units.box')}</option>
              <option value="pallet">{t('products.units.pallet')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('products.minStock')}</label>
            <input
              type="number"
              step="0.001"
              value={form.min_stock}
              onChange={(e) => setForm({ ...form, min_stock: parseFloat(e.target.value) || 0 })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('products.reorder')}</label>
            <input
              type="number"
              step="0.001"
              value={form.reorder_point}
              onChange={(e) => setForm({ ...form, reorder_point: parseFloat(e.target.value) || 0 })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('products.maxStock')}</label>
            <input
              type="number"
              step="0.001"
              value={form.max_stock}
              onChange={(e) => setForm({ ...form, max_stock: parseFloat(e.target.value) || 0 })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('products.unitCost')}</label>
            <input
              type="number"
              step="0.01"
              value={form.unit_cost}
              onChange={(e) => setForm({ ...form, unit_cost: parseFloat(e.target.value) || 0 })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('products.primarySupplier')}</label>
            <select
              value={form.primary_supplier_id || ''}
              onChange={(e) => setForm({ ...form, primary_supplier_id: e.target.value || undefined })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">{t('common.none')}</option>
              {suppliers.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              {t('common.active')}
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </form>
    </div>
  )
}
