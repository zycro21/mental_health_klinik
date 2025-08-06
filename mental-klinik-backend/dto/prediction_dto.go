package dto

type UpdatePredictionRequest struct {
	ResultLabel      string  `json:"resultLabel" binding:"required"`
	ProbabilityScore float64 `json:"probabilityScore" binding:"required,gte=0,lte=1"`
}