export * from './auth'
export * from './product'
export * from './inventory'

export type { Category, Supplier } from './product'

export interface Location {
  id: string
  name: string
  code: string
  address: string
  active: boolean
}

export interface PurchaseOrder {
  id: string
  supplier_id: string
  supplier_name?: string
  destination_location_id: string
  destination_location_name?: string
  status: 'draft' | 'pending' | 'approved' | 'sent' | 'received' | 'cancelled'
  expected_date?: string
  notes?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface PurchaseOrderItem {
  id: string
  purchase_order_id: string
  product_id: string
  product_name?: string
  quantity: number
  unit_cost: number
  total: number
}

export interface Alert {
  id: string
  type: 'low_stock' | 'reorder_point' | 'out_of_stock' | 'po_delayed' | 'suspicious_adjustment'
  product_id?: string
  product_name?: string
  location_id?: string
  location_name?: string
  message: string
  read: boolean
  created_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, string>
}
