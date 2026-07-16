package background

import (
	"context"
	"log"
	"time"

	"github.com/hugoquesada/invex/internal/services"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type Worker struct {
	db       *gorm.DB
	rdb      *redis.Client
	autoPO   *services.AutoPOService
	alerts   *services.AlertService
	stopChan chan struct{}
}

func NewWorker(db *gorm.DB, rdb *redis.Client, autoPO *services.AutoPOService, alerts *services.AlertService) *Worker {
	return &Worker{
		db:       db,
		rdb:      rdb,
		autoPO:   autoPO,
		alerts:   alerts,
		stopChan: make(chan struct{}),
	}
}

func (w *Worker) Start() {
	go w.reorderCheckLoop()
	log.Println("Background worker started")
}

func (w *Worker) Stop() {
	close(w.stopChan)
}

func (w *Worker) reorderCheckLoop() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	w.autoPO.GeneratePurchaseOrders()

	for {
		select {
		case <-ticker.C:
			w.autoPO.GeneratePurchaseOrders()
			w.checkDelayedPOs()
		case <-w.stopChan:
			return
		}
	}
}

func (w *Worker) checkDelayedPOs() {
	var delayed []struct {
		ID     string
		Number string
	}

	query := `
		SELECT id, 'PO-' || substr(id::text, 1, 8) as number
		FROM purchase_orders
		WHERE status IN ('approved', 'sent')
		AND expected_date < NOW()
		AND deleted_at IS NULL
	`

	if err := w.db.Raw(query).Scan(&delayed).Error; err != nil {
		log.Printf("Worker: failed to query delayed POs: %v", err)
		return
	}

	for _, po := range delayed {
		w.rdb.LPush(context.Background(), "invex:notifications", map[string]interface{}{
			"type":    "po_delayed",
			"po_id":   po.ID,
			"message": "Purchase order " + po.Number + " is past expected delivery date",
		})
	}
}
