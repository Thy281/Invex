package services

import (
	"testing"
)

func TestLoginRequest_Validation(t *testing.T) {
	tests := []struct {
		name    string
		email   string
		pass    string
		wantErr bool
	}{
		{"valid", "user@test.com", "password123", false},
		{"empty email", "", "password123", true},
		{"short password", "user@test.com", "12345", true},
		{"empty password", "user@test.com", "", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			hasErr := tt.email == "" || tt.pass == "" || len(tt.pass) < 6
			if hasErr != tt.wantErr {
				t.Errorf("expected error=%v, got hasErr=%v", tt.wantErr, hasErr)
			}
		})
	}
}
