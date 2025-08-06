package dto

import (
	"time"

	// "gorm.io/datatypes"
)

type AssessmentResponse struct {
	ID        string                 `json:"id"`
	PatientID string                 `json:"patientId"`
	Date      time.Time              `json:"date"`
	Answers   map[string]interface{} `json:"answers"`
	CreatedAt string                 `json:"createdAt"`
	UpdatedAt string                 `json:"updatedAt"`
	Patient   PatientMiniResponse    `json:"patient"`    // dari relasi
	Prediction *PredictionResponse   `json:"prediction"` // nullable
}

type CreateAssessmentSuccessResponse struct {
	Message string             `json:"message"`
	Data    AssessmentResponse `json:"data"`
}

// Untuk list paginated response
type PaginatedAssessmentsResponse struct {
	Data       []AssessmentResponse `json:"data"`
	Total      int                  `json:"total"`
	Page       int                  `json:"page"`
	Limit      int                  `json:"limit"`
	TotalPages int                  `json:"totalPages"`
}

type GetAssessmentByIDSuccessResponse struct {
	Data AssessmentResponse `json:"data"`
}

type AssessmentUpdateResponse struct {
	ID        string               `json:"id" example:"d72f8239-09e7-4b23-a897-3ef6211f6b0a"`
	Date      string               `json:"date" example:"2025-07-17T15:00:00Z"`
	Answers map[string]interface{} `json:"answers"`
	UpdatedAt string               `json:"updated_at" example:"2025-07-17T15:05:30Z"`
}

type UpdateAssessmentSuccessResponse struct {
	Message string                    `json:"message" example:"Assessment berhasil diperbarui"`
	Data    AssessmentUpdateResponse `json:"data"`
}