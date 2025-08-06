package database

import (
	"fmt"
	"os"
	"log"
	"gorm.io/gorm"
	"gorm.io/driver/postgres"
	"mental-klinik-backend/models"
)

var DB *gorm.DB

func ConnectDB() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to DB:", err)
	}

	DB = db

	// Migrate all models
	db.AutoMigrate(
		&models.User{},
		&models.Patient{},
		&models.Assessment{},
		&models.Prediction{},
		&models.Appointment{},
		&models.MedicalRecord{},
	)
}
