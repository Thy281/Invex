package services

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/hugoquesada/invex/internal/models"
	"github.com/hugoquesada/invex/internal/websocket"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type AlertService struct {
	db  *gorm.DB
	rdb *redis.Client
	hub *websocket.Hub
}

func NewAlertService(db *gorm.DB, rdb *redis.Client, hub *websocket.Hub) *AlertService {
	return &AlertService{db: db, rdb: rdb, hub: hub}
}

func (s *AlertService) CheckAndAlert(productID, locationID string) {
	var inv models.Inventory
	if err := s.db.Where("product_id = ? AND location_id = ?", productID, locationID).
		Preload("Product").Preload("Location").First(&inv).Error; err != nil {
		return
	}

	product := inv.Product

	if inv.Quantity <= 0 {
		s.createAlert(models.AlertOutOfStock, &productID, &locationID,
			fmt.Sprintf("%s is out of stock at %s", product.Name, inv.Location.Name))
	} else if inv.Quantity <= product.MinStock {
		s.createAlert(models.AlertLowStock, &productID, &locationID,
			fmt.Sprintf("%s has low stock: %.3f (min: %.3f)", product.Name, inv.Quantity, product.MinStock))
	} else if inv.Quantity <= product.ReorderPoint {
		s.createAlert(models.AlertReorderPoint, &productID, &locationID,
			fmt.Sprintf("%s reorder point reached: %.3f (reorder at: %.3f)", product.Name, inv.Quantity, product.ReorderPoint))
	}
}

func (s *AlertService) createAlert(alertType models.AlertType, productID, locationID *string, message string) {
	alert := models.Alert{
		Type:       alertType,
		ProductID:  productID,
		LocationID: locationID,
		Message:    message,
	}

	if err := s.db.Create(&alert).Error; err != nil {
		log.Printf("Failed to create alert: %v", err)
		return
	}

	s.hub.Broadcast(websocket.Event{
		Type: "alert.created",
		Payload: []byte(fmt.Sprintf(
			`{"id":"%s","type":"%s","message":"%s","created_at":"%s"}`,
			alert.ID, alert.Type, alert.Message, alert.CreatedAt.Format(time.RFC3339),
		)),
	})

	websocket.PublishEvent(context.Background(), s.rdb, websocket.Event{
		Type: "alert.created",
		Payload: []byte(fmt.Sprintf(
			`{"id":"%s","type":"%s","message":"%s"}`,
			alert.ID, alert.Type, alert.Message,
		)),
	})
}
