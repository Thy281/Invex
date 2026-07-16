package models

import "time"

type AlertType string

const (
	AlertLowStock            AlertType = "low_stock"
	AlertReorderPoint        AlertType = "reorder_point"
	AlertOutOfStock          AlertType = "out_of_stock"
	AlertPODelayed           AlertType = "po_delayed"
	AlertSuspiciousAdjustment AlertType = "suspicious_adjustment"
)

type Alert struct {
	ID         string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Type       AlertType `gorm:"type:alert_type;not null" json:"type"`
	ProductID  *string   `gorm:"type:uuid" json:"product_id,omitempty"`
	LocationID *string   `gorm:"type:uuid" json:"location_id,omitempty"`
	Message    string    `gorm:"not null" json:"message"`
	Read       bool      `gorm:"default:false" json:"read"`
	CreatedAt  time.Time `json:"created_at"`
}

type AlertConfig struct {
	ID              string     `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	AlertType       AlertType  `gorm:"type:alert_type;not null" json:"alert_type"`
	ProductID       *string    `gorm:"type:uuid" json:"product_id,omitempty"`
	CategoryID      *string    `gorm:"type:uuid" json:"category_id,omitempty"`
	LocationID      *string    `gorm:"type:uuid" json:"location_id,omitempty"`
	CustomThreshold *float64   `gorm:"type:numeric(15,3)" json:"custom_threshold,omitempty"`
	Active          bool       `gorm:"default:true" json:"active"`
	NotifyEmail     bool       `gorm:"default:false" json:"notify_email"`
	NotifyInternal  bool       `gorm:"default:true" json:"notify_internal"`
	CreatedBy       *string    `gorm:"type:uuid" json:"created_by,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}
