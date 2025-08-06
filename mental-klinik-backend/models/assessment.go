package models

import (
	"time"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Assessment struct {
	ID        string         `gorm:"primaryKey" json:"id"`
	PatientID string         `json:"patientId"`
	Date      time.Time      `json:"date"`
	Answers   datatypes.JSON `json:"answers"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	Patient    Patient     `gorm:"foreignKey:PatientID"`
	Prediction *Prediction `gorm:"foreignKey:AssessmentID"` // <-- gunakan pointer
}
