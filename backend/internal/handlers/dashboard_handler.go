package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/hugoquesada/invex/internal/models"
	"gorm.io/gorm"
)

type DashboardHandler struct {
	db *gorm.DB
}

func NewDashboardHandler(db *gorm.DB) *DashboardHandler {
	return &DashboardHandler{db: db}
}

func (h *DashboardHandler) GetDashboard(c *gin.Context) {
	var totalProducts, lowStock, outOfStock, pendingPOs int64
	var inventoryValue float64

	h.db.Model(&models.Product{}).Where("active = true").Count(&totalProducts)
	h.db.Model(&models.Inventory{}).Where("quantity <= (SELECT min_stock FROM products WHERE products.id = inventory.product_id) AND quantity > 0").Count(&lowStock)
	h.db.Model(&models.Inventory{}).Where("quantity <= 0").Count(&outOfStock)
	h.db.Model(&models.PurchaseOrder{}).Where("status IN ('pending', 'approved', 'sent')").Count(&pendingPOs)
	h.db.Raw("SELECT COALESCE(SUM(i.quantity * p.unit_cost), 0) FROM inventory i JOIN products p ON p.id = i.product_id").Scan(&inventoryValue)

	var recentMovements []map[string]interface{}
	h.db.Table("stock_movements").
		Select("stock_movements.*, products.name as product_name").
		Joins("JOIN products ON products.id = stock_movements.product_id").
		Order("stock_movements.created_at DESC").
		Limit(10).
		Find(&recentMovements)

	var recentAlerts []map[string]interface{}
	h.db.Model(&models.Alert{}).
		Order("created_at DESC").
		Limit(10).
		Find(&recentAlerts)

	c.JSON(http.StatusOK, gin.H{
		"total_products":     totalProducts,
		"low_stock_count":    lowStock,
		"out_of_stock_count": outOfStock,
		"inventory_value":    inventoryValue,
		"pending_pos":        pendingPOs,
		"recent_movements":   recentMovements,
		"recent_alerts":      recentAlerts,
	})
}
