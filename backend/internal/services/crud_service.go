package services

import (
	"github.com/hugoquesada/invex/internal/dto"
	"gorm.io/gorm"
)

type CRUDService[T any] struct {
	db *gorm.DB
}

func NewCRUDService[T any](db *gorm.DB) *CRUDService[T] {
	return &CRUDService[T]{db: db}
}

func (s *CRUDService[T]) Create(entity *T) error {
	return s.db.Create(entity).Error
}

func (s *CRUDService[T]) GetByID(id string, preloads ...string) (*T, error) {
	q := s.db
	for _, p := range preloads {
		q = q.Preload(p)
	}
	var entity T
	if err := q.First(&entity, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &entity, nil
}

func (s *CRUDService[T]) List(params dto.PaginationParams, preloads ...string) (*dto.PaginatedResponse, error) {
	q := s.db.Model(new(T))
	for _, p := range preloads {
		q = q.Preload(p)
	}

	if params.Search != "" {
		q = q.Where("name ILIKE ?", "%"+params.Search+"%")
	}

	var total int64
	q.Count(&total)

	if params.SortBy != "" {
		q = q.Order(params.SortBy + " " + params.SortDir)
	}

	offset := (params.Page - 1) * params.PerPage
	var entities []T
	if err := q.Offset(offset).Limit(params.PerPage).Find(&entities).Error; err != nil {
		return nil, err
	}

	totalPages := int(total) / params.PerPage
	if int(total)%params.PerPage > 0 {
		totalPages++
	}

	return &dto.PaginatedResponse{
		Data:       entities,
		Total:      total,
		Page:       params.Page,
		PerPage:    params.PerPage,
		TotalPages: totalPages,
	}, nil
}

func (s *CRUDService[T]) Update(id string, updates map[string]interface{}) error {
	return s.db.Model(new(T)).Where("id = ?", id).Updates(updates).Error
}

func (s *CRUDService[T]) Delete(id string) error {
	return s.db.Delete(new(T), "id = ?", id).Error
}
