package utils

import (
	"fmt"
	"math/rand"
	"time"
)

var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")

func generateRandomString(n int) string {
	rand.Seed(time.Now().UnixNano())
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

func GenerateCustomUserID(role string, index int) string {
	return fmt.Sprintf("%s-%03d-%s", role, index, generateRandomString(8))
}

func GenerateCustomPatientID(index int) string {
	return fmt.Sprintf("patient-%03d-%s", index, generateRandomString(8))
}

func GenerateCustomAppointmentID(index int) string {
	return fmt.Sprintf("appointment-%03d-%s", index, generateRandomString(8))
}

func GenerateCustomAssessmentID(index int) string {
	return fmt.Sprintf("assessment-%03d-%s", index, generateRandomString(8))
}

func GenerateCustomMedicalRecordID(index int) string {
	return fmt.Sprintf("record-%03d-%s", index, generateRandomString(8))
}
