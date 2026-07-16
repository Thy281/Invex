package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/hugoquesada/invex/internal/dto"
	"gorm.io/gorm"
)

type MovementListHandler struct {
	db *gorm.DB
}

func NewMovementListHandler(db *gorm.DB) *MovementListHandler {
	return &MovementListHandler{db: db}
}

func (h *MovementListHandler) List(c *gin.Context) {
	var params dto.PaginationParams
	if err := c.ShouldBindQuery(&params); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	q := h.db.Table("stock_movements").
		Select(`stock_movements.*, products.name as product_name, 
				from_loc.name as from_location_name, to_loc.name as to_location_name,
				users.name as user_name`).
		Joins("JOIN products ON products.id = stock_movements.product_id").
		Joins("LEFT JOIN locations from_loc ON from_loc.id = stock_movements.from_location_id").
		Joins("LEFT JOIN locations to_loc ON to_loc.id = stock_movements.to_location_id").
		Joins("JOIN users ON users.id = stock_movements.user_id")

	var total int64
	q.Count(&total)

	offset := (params.Page - 1) * params.PerPage
	var results []map[string]interface{}
	if err := q.Offset(offset).Limit(params.PerPage).Order("stock_movements.created_at DESC").Find(&results).Error; err != nil {
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
