package models

import (
	"time"
	"gorm.io/gorm"
)

type Prediction struct {
	ID               string         `gorm:"primaryKey" json:"id"`
	AssessmentID     string         `json:"assessmentId"`
	ResultLabel      string         `json:"resultLabel"`
	ProbabilityScore float64        `json:"probabilityScore"`
	CreatedAt        time.Time      `json:"createdAt"`
	UpdatedAt        time.Time      `json:"updatedAt"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	Assessment *Assessment `gorm:"foreignKey:AssessmentID"` // <-- gunakan pointer
}
