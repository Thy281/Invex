package auth

import "testing"

func TestHashAndCheckPassword(t *testing.T) {
	password := "securePassword123!"

	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("HashPassword failed: %v", err)
	}

	if hash == "" {
		t.Error("hash should not be empty")
	}

	if hash == password {
		t.Error("hash should not equal plaintext password")
	}

	if !CheckPassword(password, hash) {
		t.Error("CheckPassword should return true for correct password")
	}
}

func TestCheckPassword_WrongPassword(t *testing.T) {
	hash, _ := HashPassword("correct-password")

	if CheckPassword("wrong-password", hash) {
		t.Error("CheckPassword should return false for wrong password")
	}
}

func TestCheckPassword_EmptyPassword(t *testing.T) {
	hash, _ := HashPassword("some-password")

	if CheckPassword("", hash) {
		t.Error("CheckPassword should return false for empty password")
	}
}

func TestHashPassword_UniqueSalts(t *testing.T) {
	password := "same-password"

	hash1, _ := HashPassword(password)
	hash2, _ := HashPassword(password)

	if hash1 == hash2 {
		t.Error("hashes should be different due to unique salts")
	}
}
