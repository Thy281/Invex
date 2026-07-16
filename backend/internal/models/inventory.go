package models

import (
	"time"
)

type Inventory struct {
	ID         string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	ProductID  string    `gorm:"type:uuid;uniqueIndex:idx_inv_product_location;not null" json:"product_id"`
	Product    Product   `gorm:"constraint:OnDelete:RESTRICT" json:"product,omitempty"`
	LocationID string    `gorm:"type:uuid;uniqueIndex:idx_inv_product_location;not null" json:"location_id"`
	Location   Location  `gorm:"constraint:OnDelete:RESTRICT" json:"location,omitempty"`
	Quantity   float64   `gorm:"type:numeric(15,3);default:0" json:"quantity"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
