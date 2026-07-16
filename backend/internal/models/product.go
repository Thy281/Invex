package models

import (
	"time"

	"gorm.io/gorm"
)

type Product struct {
	ID               string          `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name             string          `gorm:"size:255;not null" json:"name"`
	SKU              string          `gorm:"uniqueIndex;size:100;not null" json:"sku"`
	InternalCode     *string         `gorm:"size:100" json:"internal_code,omitempty"`
	Description      *string         `json:"description,omitempty"`
	CategoryID       string          `gorm:"type:uuid;not null" json:"category_id"`
	Category         Category        `gorm:"constraint:OnDelete:RESTRICT" json:"category,omitempty"`
	UnitOfMeasure    string          `gorm:"size:50;default:unit" json:"unit_of_measure"`
	MinStock         float64         `gorm:"type:numeric(15,3);default:0" json:"min_stock"`
	ReorderPoint     float64         `gorm:"type:numeric(15,3);default:0" json:"reorder_point"`
	MaxStock         float64         `gorm:"type:numeric(15,3);default:0" json:"max_stock"`
	UnitCost         float64         `gorm:"type:numeric(15,2);default:0" json:"unit_cost"`
	PrimarySupplierID *string        `gorm:"type:uuid" json:"primary_supplier_id,omitempty"`
	PrimarySupplier  *Supplier       `gorm:"constraint:OnDelete:SET NULL" json:"primary_supplier,omitempty"`
	Active           bool            `gorm:"default:true" json:"active"`
	EAN              *string         `gorm:"size:13" json:"ean,omitempty"`
	UPC              *string         `gorm:"size:12" json:"upc,omitempty"`
	Barcode          *string         `json:"barcode,omitempty"`
	CreatedBy        *string         `gorm:"type:uuid" json:"created_by,omitempty"`
	UpdatedBy        *string         `gorm:"type:uuid" json:"updated_by,omitempty"`
	CreatedAt        time.Time       `json:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at"`
	DeletedAt        gorm.DeletedAt  `gorm:"index" json:"deleted_at,omitempty"`
}
