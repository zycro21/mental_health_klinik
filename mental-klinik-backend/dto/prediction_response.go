package dto

import (
	"time"
)

// Mini response untuk prediction
type PredictionResponse struct {
	ID               string  `json:"id"`
	AssessmentID     string  `json:"assessmentId"`
	ResultLabel      string  `json:"resultLabel"`
	ProbabilityScore float64 `json:"probabilityScore"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}

type PaginatedPredictionsResponse struct {
	Data       []PredictionResponse `json:"data"`
	Total      int                  `json:"total"`
	Page       int                  `json:"page"`
	Limit      int                  `json:"limit"`
	TotalPages int                  `json:"totalPages"`
}
