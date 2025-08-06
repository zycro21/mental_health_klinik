package models

import (
	"time"

	"gorm.io/gorm"
)

type Patient struct {
	ID               string         `gorm:"primaryKey" json:"id"`
	FullName         string         `json:"fullName"`
	NIK              string         `gorm:"unique" json:"nik"`
	BirthDate        string         `json:"birthDate"`
	Gender           string         `json:"gender"`
	Phone            string         `json:"phone"`
	Address          string         `json:"address"`
	EmergencyContact string         `json:"emergencyContact"`
	CreatedAt        time.Time      `json:"createdAt"`
	UpdatedAt        time.Time      `json:"updatedAt"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	Appointments    []Appointment    `gorm:"foreignKey:PatientID"`
	Assessments     []Assessment     `gorm:"foreignKey:PatientID"`
	MedicalRecords  []MedicalRecord  `gorm:"foreignKey:PatientID"`
}