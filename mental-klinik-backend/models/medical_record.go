package models

import (
	"time"

	"gorm.io/gorm"
)

type MedicalRecord struct {
	ID        string         `gorm:"primaryKey" json:"id"`
	PatientID string         `json:"patientId"`
	UserID    string         `json:"userId"`
	Diagnosis string         `json:"diagnosis"`
	Treatment string         `json:"treatment"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	Patient Patient `gorm:"foreignKey:PatientID"`
	User    User    `gorm:"foreignKey:UserID"`
}
