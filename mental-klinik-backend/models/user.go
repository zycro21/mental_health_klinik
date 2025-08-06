package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        string         `gorm:"primaryKey" json:"id"`
	FullName  string         `json:"fullName" binding:"required"`
	Email     string         `gorm:"unique" json:"email" binding:"required,email"`
	Password  string         `json:"password" binding:"required,min=6"`
	Role      string         `json:"role" binding:"required,oneof=admin doctor staff"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	Appointments    []Appointment    `gorm:"foreignKey:UserID"`
	MedicalRecords  []MedicalRecord  `gorm:"foreignKey:UserID"`
}