package models

import "time"

type MovementType string

const (
	MovementIn         MovementType = "in"
	MovementOut        MovementType = "out"
	MovementTransfer   MovementType = "transfer"
	MovementAdjustment MovementType = "adjustment"
)

type StockMovement struct {
	ID               string       `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Type             MovementType `gorm:"type:movement_type;not null" json:"type"`
	ProductID        string       `gorm:"type:uuid;not null" json:"product_id"`
	Product          Product      `gorm:"constraint:OnDelete:RESTRICT" json:"product,omitempty"`
	FromLocationID   *string      `gorm:"type:uuid" json:"from_location_id,omitempty"`
	FromLocation     *Location    `gorm:"constraint:OnDelete:RESTRICT" json:"from_location,omitempty"`
	ToLocationID     *string      `gorm:"type:uuid" json:"to_location_id,omitempty"`
	ToLocation       *Location    `gorm:"constraint:OnDelete:RESTRICT" json:"to_location,omitempty"`
	Quantity         float64      `gorm:"type:numeric(15,3);not null" json:"quantity"`
	PreviousQuantity float64      `gorm:"type:numeric(15,3);default:0" json:"previous_quantity"`
	NewQuantity      float64      `gorm:"type:numeric(15,3);default:0" json:"new_quantity"`
	Reason           string       `gorm:"not null" json:"reason"`
	ReferenceType    *string      `gorm:"size:50" json:"reference_type,omitempty"`
	ReferenceID      *string      `gorm:"type:uuid" json:"reference_id,omitempty"`
	UserID           string       `gorm:"type:uuid;not null" json:"user_id"`
	User             User         `gorm:"constraint:OnDelete:RESTRICT" json:"user,omitempty"`
	CreatedAt        time.Time    `json:"created_at"`
}
