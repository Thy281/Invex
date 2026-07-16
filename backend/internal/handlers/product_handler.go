package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/hugoquesada/invex/internal/dto"
	"github.com/hugoquesada/invex/internal/models"
	"github.com/hugoquesada/invex/internal/services"
)

type ProductHandler struct {
	crud *services.CRUDService[models.Product]
}

func NewProductHandler(crud *services.CRUDService[models.Product]) *ProductHandler {
	return &ProductHandler{crud: crud}
}

func (h *ProductHandler) List(c *gin.Context) {
	var params dto.PaginationParams
	if err := c.ShouldBindQuery(&params); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.crud.List(params, "Category", "PrimarySupplier")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *ProductHandler) Get(c *gin.Context) {
	id := c.Param("id")
	product, err := h.crud.GetByID(id, "Category", "PrimarySupplier")
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
		return
	}

	c.JSON(http.StatusOK, product)
}

func (h *ProductHandler) Create(c *gin.Context) {
	var req dto.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetString("user_id")
	product := models.Product{
		Name:              req.Name,
		SKU:               req.SKU,
		InternalCode:      req.InternalCode,
		Description:       req.Description,
		CategoryID:        req.CategoryID,
		UnitOfMeasure:     req.UnitOfMeasure,
		MinStock:          req.MinStock,
		ReorderPoint:      req.ReorderPoint,
		MaxStock:          req.MaxStock,
		UnitCost:          req.UnitCost,
		PrimarySupplierID: req.PrimarySupplierID,
		Active:            req.Active,
		CreatedBy:         &userID,
	}

	if err := h.crud.Create(&product); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, product)
}

func (h *ProductHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{}
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.SKU != nil {
		updates["sku"] = *req.SKU
	}
	if req.InternalCode != nil {
		updates["internal_code"] = *req.InternalCode
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.CategoryID != nil {
		updates["category_id"] = *req.CategoryID
	}
	if req.UnitOfMeasure != nil {
		updates["unit_of_measure"] = *req.UnitOfMeasure
	}
	if req.MinStock != nil {
		updates["min_stock"] = *req.MinStock
	}
	if req.ReorderPoint != nil {
		updates["reorder_point"] = *req.ReorderPoint
	}
	if req.MaxStock != nil {
		updates["max_stock"] = *req.MaxStock
	}
	if req.UnitCost != nil {
		updates["unit_cost"] = *req.UnitCost
	}
	if req.PrimarySupplierID != nil {
		updates["primary_supplier_id"] = *req.PrimarySupplierID
	}
	if req.Active != nil {
		updates["active"] = *req.Active
	}

	if err := h.crud.Update(id, updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	product, _ := h.crud.GetByID(id)
	c.JSON(http.StatusOK, product)
}

func (h *ProductHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.crud.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}
