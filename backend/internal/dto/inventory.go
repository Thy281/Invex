package dto

type StockInRequest struct {
	ProductID  string  `json:"product_id" binding:"required"`
	LocationID string  `json:"location_id" binding:"required"`
	Quantity   float64 `json:"quantity" binding:"required,gt=0"`
	Reason     string  `json:"reason" binding:"required"`
}

type StockOutRequest struct {
	ProductID  string  `json:"product_id" binding:"required"`
	LocationID string  `json:"location_id" binding:"required"`
	Quantity   float64 `json:"quantity" binding:"required,gt=0"`
	Reason     string  `json:"reason" binding:"required"`
}

type TransferRequest struct {
	ProductID       string  `json:"product_id" binding:"required"`
	FromLocationID  string  `json:"from_location_id" binding:"required"`
	ToLocationID    string  `json:"to_location_id" binding:"required"`
	Quantity        float64 `json:"quantity" binding:"required,gt=0"`
	Reason          string  `json:"reason" binding:"required"`
}

type AdjustmentRequest struct {
	ProductID   string  `json:"product_id" binding:"required"`
	LocationID  string  `json:"location_id" binding:"required"`
	NewQuantity float64 `json:"new_quantity" binding:"required"`
	Reason      string  `json:"reason" binding:"required"`
}
