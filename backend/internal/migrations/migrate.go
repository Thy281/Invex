package migrations

import (
	"fmt"

	"github.com/hugoquesada/invex/internal/models"
	"gorm.io/gorm"
)

func Run(db *gorm.DB) error {
	for _, e := range []struct{ name, values string }{
		{"movement_type", "'in','out','transfer','adjustment'"},
		{"po_status", "'draft','pending','approved','sent','received','cancelled'"},
		{"alert_type", "'low_stock','reorder_point','out_of_stock','po_delayed','suspicious_adjustment'"},
	} {
		if err := db.Exec(
			`DO $do$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '` + e.name + `') THEN CREATE TYPE ` + e.name + ` AS ENUM (` + e.values + `); END IF; END $do$;`,
		).Error; err != nil {
			return fmt.Errorf("create %s enum: %w", e.name, err)
		}
	}

	themeDefault := "ALTER TABLE users ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'system'"
	if err := db.Exec(themeDefault).Error; err != nil {
		return fmt.Errorf("add theme column: %w", err)
	}
	if err := db.Exec("UPDATE users SET theme = 'system' WHERE theme IS NULL OR theme = ''").Error; err != nil {
		return fmt.Errorf("set default theme: %w", err)
	}

	if err := db.AutoMigrate(
		&models.Role{},
		&models.User{},
		&models.Category{},
		&models.Supplier{},
		&models.Location{},
		&models.Product{},
		&models.Inventory{},
		&models.StockMovement{},
		&models.PurchaseOrder{},
		&models.PurchaseOrderItem{},
		&models.Alert{},
		&models.AlertConfig{},
		&models.Notification{},
		&models.AuditLog{},
	); err != nil {
		return fmt.Errorf("auto migrate: %w", err)
	}

	if err := seedRoles(db); err != nil {
		return fmt.Errorf("seed roles: %w", err)
	}

	return nil
}

func seedRoles(db *gorm.DB) error {
	roles := []models.Role{
		{Name: "admin", Description: ptr("Full system access")},
		{Name: "manager", Description: ptr("Operational management access")},
		{Name: "operator", Description: ptr("Daily operations access")},
		{Name: "viewer", Description: ptr("Read-only access")},
	}

	for _, role := range roles {
		var existing models.Role
		if err := db.Where("name = ?", role.Name).First(&existing).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				if err := db.Create(&role).Error; err != nil {
					return fmt.Errorf("create role %s: %w", role.Name, err)
				}
			} else {
				return err
			}
		}
	}

	return nil
}

func ptr(s string) *string {
	return &s
}
