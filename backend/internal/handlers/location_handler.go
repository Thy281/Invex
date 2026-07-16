package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/hugoquesada/invex/internal/dto"
	"github.com/hugoquesada/invex/internal/models"
	"github.com/hugoquesada/invex/internal/services"
)

type LocationHandler struct {
	crud *services.CRUDService[models.Location]
}

func NewLocationHandler(crud *services.CRUDService[models.Location]) *LocationHandler {
	return &LocationHandler{crud: crud}
}

func (h *LocationHandler) List(c *gin.Context) {
	var params dto.PaginationParams
	if err := c.ShouldBindQuery(&params); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	resp, err := h.crud.List(params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, resp)
}

func (h *LocationHandler) Get(c *gin.Context) {
	id := c.Param("id")
	location, err := h.crud.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "location not found"})
		return
	}
	c.JSON(http.StatusOK, location)
}

func (h *LocationHandler) Create(c *gin.Context) {
	var req dto.CreateLocationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetString("user_id")
	location := models.Location{
		Name:      req.Name,
		Code:      req.Code,
		Address:   req.Address,
		Active:    req.Active,
		CreatedBy: &userID,
	}

	if err := h.crud.Create(&location); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, location)
}

func (h *LocationHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateLocationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{}
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.Code != nil {
		updates["code"] = *req.Code
	}
	if req.Address != nil {
		updates["address"] = *req.Address
	}
	if req.Active != nil {
		updates["active"] = *req.Active
	}

	if err := h.crud.Update(id, updates); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	location, _ := h.crud.GetByID(id)
	c.JSON(http.StatusOK, location)
}

func (h *LocationHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.crud.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, nil)
}
