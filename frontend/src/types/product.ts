export interface Category {
  id: string
  name: string
  description?: string
  active: boolean
}

export interface Supplier {
  id: string
  name: string
  tax_id: string
  email?: string
  phone?: string
  address?: string
  contact_person?: string
  active: boolean
}

export interface Product {
  id: string
  name: string
  sku: string
  internal_code: string
  description: string
  category_id: string
  category?: Category
  unit_of_measure: string
  min_stock: number
  reorder_point: number
  max_stock: number
  unit_cost: number
  primary_supplier_id?: string
  primary_supplier?: Supplier
  active: boolean
  created_at: string
  updated_at: string
}

export interface ProductForm {
  name: string
  sku: string
  internal_code: string
  description: string
  category_id: string
  unit_of_measure: string
  min_stock: number
  reorder_point: number
  max_stock: number
  unit_cost: number
  primary_supplier_id?: string
  active: boolean
}
