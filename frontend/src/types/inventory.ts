export interface Inventory {
  id: string
  product_id: string
  product_name?: string
  product_sku?: string
  location_id: string
  location_name?: string
  quantity: number
  created_at: string
  updated_at: string
}

export interface StockMovement {
  id: string
  type: 'in' | 'out' | 'transfer' | 'adjustment'
  product_id: string
  product_name?: string
  from_location_id?: string
  from_location_name?: string
  to_location_id?: string
  to_location_name?: string
  quantity: number
  reason: string
  user_id: string
  user_name?: string
  created_at: string
}
