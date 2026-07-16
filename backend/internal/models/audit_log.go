package models

import (
	"encoding/json"
	"time"
)

type AuditLog struct {
	ID        string          `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID    *string         `gorm:"type:uuid" json:"user_id,omitempty"`
	Action    string          `gorm:"size:100;not null" json:"action"`
	Entity    string          `gorm:"size:100;not null" json:"entity"`
	EntityID  *string         `gorm:"type:uuid" json:"entity_id,omitempty"`
	OldValues json.RawMessage `gorm:"type:jsonb" json:"old_values,omitempty"`
	NewValues json.RawMessage `gorm:"type:jsonb" json:"new_values,omitempty"`
	IPAddress *string         `gorm:"size:45" json:"ip_address,omitempty"`
	UserAgent *string         `json:"user_agent,omitempty"`
	CreatedAt time.Time       `json:"created_at"`
}
