package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name      string         `gorm:"size:255;not null" json:"name"`
	Email     string         `gorm:"uniqueIndex;size:255;not null" json:"email"`
	Password  string         `gorm:"size:255;not null" json:"-"`
	RoleID    string         `gorm:"type:uuid;not null" json:"role_id"`
	Role      Role           `gorm:"constraint:OnDelete:RESTRICT" json:"role,omitempty"`
	Active    bool           `gorm:"default:true" json:"active"`
	Theme     string         `gorm:"default:system" json:"theme"`
	CreatedBy *string        `gorm:"type:uuid" json:"created_by,omitempty"`
	UpdatedBy *string        `gorm:"type:uuid" json:"updated_by,omitempty"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}
