package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/hugoquesada/invex/internal/dto"
	"gorm.io/gorm"
)

type InventoryListHandler struct {
	db *gorm.DB
}

func NewInventoryListHandler(db *gorm.DB) *InventoryListHandler {
	return &InventoryListHandler{db: db}
}

func (h *InventoryListHandler) List(c *gin.Context) {
	var params dto.PaginationParams
	if err := c.ShouldBindQuery(&params); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	view := c.DefaultQuery("view", "consolidated")

	q := h.db.Table("inventory").
		Select(`inventory.*, products.name as product_name, products.sku as product_sku,
				locations.name as location_name, locations.code as location_code`).
		Joins("JOIN products ON products.id = inventory.product_id").
		Joins("JOIN locations ON locations.id = inventory.location_id")

	if view == "consolidated" {
		q = q.Select(`products.id as product_id, products.name as product_name, products.sku as product_sku,
				SUM(inventory.quantity) as quantity`).
			Group("products.id, products.name, products.sku")
	}

	if params.Search != "" {
		q = q.Where("products.name ILIKE ? OR products.sku ILIKE ?", "%"+params.Search+"%", "%"+params.Search+"%")
	}

	var total int64
	q.Count(&total)

	offset := (params.Page - 1) * params.PerPage
	var results []map[string]interface{}
	if err := q.Offset(offset).Limit(params.PerPage).Order("products.name ASC").Find(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	totalPages := int(total) / params.PerPage
	if int(total)%params.PerPage > 0 {
		totalPages++
	}

	c.JSON(http.StatusOK, dto.PaginatedResponse{
		Data:       results,
		Total:      total,
		Page:       params.Page,
		PerPage:    params.PerPage,
		TotalPages: totalPages,
	})
}
