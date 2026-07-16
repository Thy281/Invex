package models

import "time"

type Notification struct {
	ID        string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID    string    `gorm:"type:uuid;not null" json:"user_id"`
	Title     string    `gorm:"size:255;not null" json:"title"`
	Message   string    `gorm:"not null" json:"message"`
	Read      bool      `gorm:"default:false" json:"read"`
	Channel   string    `gorm:"size:50;default:internal" json:"channel"`
	CreatedAt time.Time `json:"created_at"`
}
