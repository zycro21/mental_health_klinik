package dto

import (
	"time"

	// "gorm.io/datatypes"
)

type CreateAssessmentRequest struct {
	PatientID string                 `json:"patientId" binding:"required"`
	Date      time.Time              `json:"date" binding:"required" time_format:"2006-01-02"` // sesuai format date ISO
	Answers   map[string]interface{} `json:"answers"`                    // Raw JSON
}

type UpdateAssessmentRequest struct {
	Date     time.Time              `json:"date" binding:"required"`
	Answers  map[string]interface{} `json:"answers"`
}
 