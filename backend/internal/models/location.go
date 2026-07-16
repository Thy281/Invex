package models

import (
	"time"

	"gorm.io/gorm"
)

type Location struct {
	ID        string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name      string         `gorm:"size:255;not null" json:"name"`
	Code      string         `gorm:"uniqueIndex;size:50;not null" json:"code"`
	Address   *string        `json:"address,omitempty"`
	Active    bool           `gorm:"default:true" json:"active"`
	CreatedBy *string        `gorm:"type:uuid" json:"created_by,omitempty"`
	UpdatedBy *string        `gorm:"type:uuid" json:"updated_by,omitempty"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}
