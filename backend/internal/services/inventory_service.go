package services

import (
	"errors"
	"fmt"

	"github.com/hugoquesada/invex/internal/dto"
	"github.com/hugoquesada/invex/internal/models"
	"github.com/hugoquesada/invex/internal/websocket"
	"gorm.io/gorm"
)

type InventoryService struct {
	db        *gorm.DB
	hub       *websocket.Hub
	alertSvc  *AlertService
}

func NewInventoryService(db *gorm.DB, hub *websocket.Hub, alertSvc *AlertService) *InventoryService {
	return &InventoryService{db: db, hub: hub, alertSvc: alertSvc}
}

func (s *InventoryService) StockIn(userID string, req dto.StockInRequest) (*models.StockMovement, error) {
	var movement models.StockMovement

	err := s.db.Transaction(func(tx *gorm.DB) error {
		var inv models.Inventory
		result := tx.Where("product_id = ? AND location_id = ?", req.ProductID, req.LocationID).First(&inv)

		prevQty := inv.Quantity
		newQty := prevQty + req.Quantity

		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			inv = models.Inventory{
				ProductID:  req.ProductID,
				LocationID: req.LocationID,
				Quantity:   req.Quantity,
			}
			if err := tx.Create(&inv).Error; err != nil {
				return err
			}
		} else if result.Error != nil {
			return result.Error
		} else {
			if err := tx.Model(&inv).Update("quantity", newQty).Error; err != nil {
				return err
			}
		}

		movement = models.StockMovement{
			Type:             models.MovementIn,
			ProductID:        req.ProductID,
			ToLocationID:     &req.LocationID,
			Quantity:         req.Quantity,
			PreviousQuantity: prevQty,
			NewQuantity:      newQty,
			Reason:           req.Reason,
			UserID:           userID,
		}
		return tx.Create(&movement).Error
	})

	if err != nil {
		return nil, err
	}

	s.broadcastMovement(movement)
	if s.alertSvc != nil {
		s.alertSvc.CheckAndAlert(req.ProductID, req.LocationID)
	}
	return &movement, nil
}

func (s *InventoryService) StockOut(userID string, req dto.StockOutRequest) (*models.StockMovement, error) {
	var movement models.StockMovement

	err := s.db.Transaction(func(tx *gorm.DB) error {
		var inv models.Inventory
		if err := tx.Where("product_id = ? AND location_id = ?", req.ProductID, req.LocationID).First(&inv).Error; err != nil {
			return fmt.Errorf("insufficient inventory: %w", err)
		}

		if inv.Quantity < req.Quantity {
			return fmt.Errorf("insufficient inventory: have %.3f, need %.3f", inv.Quantity, req.Quantity)
		}

		newQty := inv.Quantity - req.Quantity
		if err := tx.Model(&inv).Update("quantity", newQty).Error; err != nil {
			return err
		}

		movement = models.StockMovement{
			Type:             models.MovementOut,
			ProductID:        req.ProductID,
			FromLocationID:   &req.LocationID,
			Quantity:         req.Quantity,
			PreviousQuantity: inv.Quantity,
			NewQuantity:      newQty,
			Reason:           req.Reason,
			UserID:           userID,
		}
		return tx.Create(&movement).Error
	})

	if err != nil {
		return nil, err
	}

	s.broadcastMovement(movement)
	if s.alertSvc != nil {
		s.alertSvc.CheckAndAlert(req.ProductID, req.LocationID)
	}
	return &movement, nil
}

func (s *InventoryService) Transfer(userID string, req dto.TransferRequest) (*models.StockMovement, error) {
	var movement models.StockMovement

	err := s.db.Transaction(func(tx *gorm.DB) error {
		var fromInv models.Inventory
		if err := tx.Where("product_id = ? AND location_id = ?", req.ProductID, req.FromLocationID).First(&fromInv).Error; err != nil {
			return fmt.Errorf("insufficient inventory at source: %w", err)
		}

		if fromInv.Quantity < req.Quantity {
			return fmt.Errorf("insufficient inventory: have %.3f, need %.3f", fromInv.Quantity, req.Quantity)
		}

		fromNewQty := fromInv.Quantity - req.Quantity
		if err := tx.Model(&fromInv).Update("quantity", fromNewQty).Error; err != nil {
			return err
		}

		var toInv models.Inventory
		result := tx.Where("product_id = ? AND location_id = ?", req.ProductID, req.ToLocationID).First(&toInv)

		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			toInv = models.Inventory{
				ProductID:  req.ProductID,
				LocationID: req.ToLocationID,
				Quantity:   req.Quantity,
			}
			if err := tx.Create(&toInv).Error; err != nil {
				return err
			}
		} else if result.Error != nil {
			return result.Error
		} else {
			if err := tx.Model(&toInv).Update("quantity", toInv.Quantity+req.Quantity).Error; err != nil {
				return err
			}
		}

		movement = models.StockMovement{
			Type:             models.MovementTransfer,
			ProductID:        req.ProductID,
			FromLocationID:   &req.FromLocationID,
			ToLocationID:     &req.ToLocationID,
			Quantity:         req.Quantity,
			PreviousQuantity: fromInv.Quantity,
			NewQuantity:      fromNewQty,
			Reason:           req.Reason,
			UserID:           userID,
		}
		return tx.Create(&movement).Error
	})

	if err != nil {
		return nil, err
	}

	s.broadcastMovement(movement)
	if s.alertSvc != nil {
		s.alertSvc.CheckAndAlert(req.ProductID, req.ToLocationID)
	}
	return &movement, nil
}

func (s *InventoryService) Adjust(userID string, req dto.AdjustmentRequest) (*models.StockMovement, error) {
	var movement models.StockMovement

	err := s.db.Transaction(func(tx *gorm.DB) error {
		var inv models.Inventory
		result := tx.Where("product_id = ? AND location_id = ?", req.ProductID, req.LocationID).First(&inv)

		prevQty := inv.Quantity
		diff := req.NewQuantity - prevQty

		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			inv = models.Inventory{
				ProductID:  req.ProductID,
				LocationID: req.LocationID,
				Quantity:   req.NewQuantity,
			}
			if err := tx.Create(&inv).Error; err != nil {
				return err
			}
		} else if result.Error != nil {
			return result.Error
		} else {
			if err := tx.Model(&inv).Update("quantity", req.NewQuantity).Error; err != nil {
				return err
			}
		}

		movement = models.StockMovement{
			Type:             models.MovementAdjustment,
			ProductID:        req.ProductID,
			ToLocationID:     &req.LocationID,
			Quantity:         diff,
			PreviousQuantity: prevQty,
			NewQuantity:      req.NewQuantity,
			Reason:           req.Reason,
			UserID:           userID,
		}
		return tx.Create(&movement).Error
	})

	if err != nil {
		return nil, err
	}

	s.broadcastMovement(movement)
	if s.alertSvc != nil {
		s.alertSvc.CheckAndAlert(req.ProductID, req.LocationID)
	}
	return &movement, nil
}

func (s *InventoryService) broadcastMovement(m models.StockMovement) {
	s.hub.Broadcast(websocket.Event{
		Type: "stock.updated",
		Payload: []byte(fmt.Sprintf(
			`{"type":"%s","product_id":"%s","quantity":%.3f,"reason":"%s"}`,
			m.Type, m.ProductID, m.Quantity, m.Reason,
		)),
	})
}
