package auth

import (
	"testing"
	"time"
)

func TestGenerateAndValidateTokens(t *testing.T) {
	secret := "test-secret-key-12345"
	accessExpiry := 15 * time.Minute
	refreshExpiry := 7 * 24 * time.Hour

	access, refresh, err := GenerateTokens(secret, "user-123", "test@example.com", "admin", accessExpiry, refreshExpiry)
	if err != nil {
		t.Fatalf("GenerateTokens failed: %v", err)
	}

	if access == "" {
		t.Error("access token should not be empty")
	}
	if refresh == "" {
		t.Error("refresh token should not be empty")
	}

	claims, err := ValidateToken(secret, access)
	if err != nil {
		t.Fatalf("ValidateToken failed: %v", err)
	}

	if claims.UserID != "user-123" {
		t.Errorf("expected user_id 'user-123', got '%s'", claims.UserID)
	}
	if claims.Email != "test@example.com" {
		t.Errorf("expected email 'test@example.com', got '%s'", claims.Email)
	}
	if claims.Role != "admin" {
		t.Errorf("expected role 'admin', got '%s'", claims.Role)
	}
}

func TestValidateToken_InvalidSignature(t *testing.T) {
	secret := "correct-secret"
	access, _, err := GenerateTokens(secret, "user-1", "a@b.com", "viewer", 15*time.Minute, 7*24*time.Hour)
	if err != nil {
		t.Fatalf("GenerateTokens failed: %v", err)
	}

	_, err = ValidateToken("wrong-secret", access)
	if err == nil {
		t.Error("expected error for wrong secret, got nil")
	}
}

func TestValidateToken_Expired(t *testing.T) {
	secret := "test-secret"
	access, _, err := GenerateTokens(secret, "user-1", "a@b.com", "viewer", -1*time.Minute, 7*24*time.Hour)
	if err != nil {
		t.Fatalf("GenerateTokens failed: %v", err)
	}

	_, err = ValidateToken(secret, access)
	if err == nil {
		t.Error("expected error for expired token, got nil")
	}
}

func TestValidateToken_InvalidFormat(t *testing.T) {
	secret := "test-secret"
	_, err := ValidateToken(secret, "not-a-valid-jwt")
	if err == nil {
		t.Error("expected error for invalid jwt format, got nil")
	}
}

func TestGenerateTokens_DifferentUsers(t *testing.T) {
	secret := "test-secret"

	access1, _, _ := GenerateTokens(secret, "user-a", "a@test.com", "admin", 15*time.Minute, 7*24*time.Hour)
	access2, _, _ := GenerateTokens(secret, "user-b", "b@test.com", "manager", 15*time.Minute, 7*24*time.Hour)

	claims1, _ := ValidateToken(secret, access1)
	claims2, _ := ValidateToken(secret, access2)

	if claims1.UserID == claims2.UserID {
		t.Error("tokens for different users should have different user IDs")
	}
	if claims1.Role != "admin" {
		t.Errorf("expected role 'admin', got '%s'", claims1.Role)
	}
	if claims2.Role != "manager" {
		t.Errorf("expected role 'manager', got '%s'", claims2.Role)
	}
}
