package models

import (
	"time"

	"gorm.io/gorm"
)

type Appointment struct {
	ID         string         `gorm:"primaryKey" json:"id"`
	PatientID  string         `json:"patientId"`
	UserID     string         `json:"userId"`
	ScheduleAt time.Time      `json:"scheduleAt"`
	Status     string         `json:"status"` // pending, done, cancelled
	Notes      string         `json:"notes"`
	CreatedAt  time.Time      `json:"createdAt"`
	UpdatedAt  time.Time      `json:"updatedAt"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	Patient Patient `gorm:"foreignKey:PatientID"`
	User    User    `gorm:"foreignKey:UserID"`
}
