package utils

import (
	"golang.org/x/crypto/bcrypt"
)

// HashPass (hashes plain password)
func HashPassword(pw string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(pw), 14)
	return string(bytes), err
}

// CheckPassHash (compares plain and hash password)
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}