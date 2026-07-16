package migrations

import (
	"fmt"

	"github.com/hugoquesada/invex/internal/models"
	"gorm.io/gorm"
)

func Run(db *gorm.DB) error {
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
