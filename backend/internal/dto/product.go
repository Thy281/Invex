package dto

type CreateProductRequest struct {
	Name             string  `json:"name" binding:"required"`
	SKU              string  `json:"sku" binding:"required"`
	InternalCode     *string `json:"internal_code"`
	Description      *string `json:"description"`
	CategoryID       string  `json:"category_id" binding:"required"`
	UnitOfMeasure    string  `json:"unit_of_measure" binding:"required"`
	MinStock         float64 `json:"min_stock"`
	ReorderPoint     float64 `json:"reorder_point"`
	MaxStock         float64 `json:"max_stock"`
	UnitCost         float64 `json:"unit_cost"`
	PrimarySupplierID *string `json:"primary_supplier_id"`
	Active           bool    `json:"active"`
}

type UpdateProductRequest struct {
	Name             *string  `json:"name"`
	SKU              *string  `json:"sku"`
	InternalCode     *string  `json:"internal_code"`
	Description      *string  `json:"description"`
	CategoryID       *string  `json:"category_id"`
	UnitOfMeasure    *string  `json:"unit_of_measure"`
	MinStock         *float64 `json:"min_stock"`
	ReorderPoint     *float64 `json:"reorder_point"`
	MaxStock         *float64 `json:"max_stock"`
	UnitCost         *float64 `json:"unit_cost"`
	PrimarySupplierID *string `json:"primary_supplier_id"`
	Active           *bool    `json:"active"`
}
