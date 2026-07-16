package services

import (
	"errors"
	"time"

	"github.com/hugoquesada/invex/internal/auth"
	"github.com/hugoquesada/invex/internal/config"
	"github.com/hugoquesada/invex/internal/dto"
	"github.com/hugoquesada/invex/internal/models"
	"gorm.io/gorm"
)

type AuthService struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewAuthService(db *gorm.DB, cfg *config.Config) *AuthService {
	return &AuthService{db: db, cfg: cfg}
}

func (s *AuthService) Login(req dto.LoginRequest) (*dto.LoginResponse, error) {
	var user models.User
	if err := s.db.Where("email = ?", req.Email).Preload("Role").First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid credentials")
		}
		return nil, err
	}

	if !user.Active {
		return nil, errors.New("account is disabled")
	}

	if !auth.CheckPassword(req.Password, user.Password) {
		return nil, errors.New("invalid credentials")
	}

	accessExpiry, _ := time.ParseDuration(s.cfg.JWTAccessExpiry)
	refreshExpiry, _ := time.ParseDuration(s.cfg.JWTRefreshExpiry)

	accessToken, refreshToken, err := auth.GenerateTokens(
		s.cfg.JWTSecret, user.ID, user.Email, user.Role.Name,
		accessExpiry, refreshExpiry,
	)
	if err != nil {
		return nil, err
	}

	return &dto.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User: dto.UserDTO{
			ID:     user.ID,
			Name:   user.Name,
			Email:  user.Email,
			RoleID: user.RoleID,
			Role:   user.Role.Name,
			Active: user.Active,
		},
	}, nil
}

func (s *AuthService) GetUser(userID string) (*dto.UserDTO, error) {
	var user models.User
	if err := s.db.Preload("Role").First(&user, "id = ?", userID).Error; err != nil {
		return nil, err
	}

	return &dto.UserDTO{
		ID:     user.ID,
		Name:   user.Name,
		Email:  user.Email,
		RoleID: user.RoleID,
		Role:   user.Role.Name,
		Active: user.Active,
	}, nil
}
