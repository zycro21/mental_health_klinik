package dto

// import "time"

type CreateMedicalRecordRequest struct {
	PatientID string `json:"patientId" binding:"required"`
	UserID    string `json:"userId" binding:"required"`
	Diagnosis string `json:"diagnosis" binding:"required"`
	Treatment string `json:"treatment" binding:"required"`
}

type UpdateMedicalRecordRequest struct {
	PatientID string `json:"patientId" binding:"required"`
	UserID    string `json:"userId" binding:"required"`
	Diagnosis string `json:"diagnosis" binding:"required"`
	Treatment string `json:"treatment" binding:"required"`
}

