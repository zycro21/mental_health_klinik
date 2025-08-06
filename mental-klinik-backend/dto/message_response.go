package dto

type MessageDeleteResponse struct {
	Message string `json:"message" example:"User Deleted Successfully"`
}

type MessageDeletePatientResponse struct {
	Message string `json:"message" example:"Patient deleted successfully"`
}

type MessageDeleteAppointmentResponse struct {
	Message string `json:"message"`
}

// Untuk response sukses
type MessageUpdateStatusAppoinmentResponse struct {
	Message string `json:"message"`
}

type MessageDeletePredictionResponse struct {
	Message string `json:"message"`
}

type MessageDeleteAssesmentResponse struct {
	Message string `json:"message"`
}