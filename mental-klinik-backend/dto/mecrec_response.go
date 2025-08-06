package dto

import "time"

type MedicalRecordResponse struct {
	ID        string                 `json:"id"`
	PatientID string                 `json:"patientId"`
	UserID    string                 `json:"userId"`
	Diagnosis string                 `json:"diagnosis"`
	Treatment string                 `json:"treatment"`
	CreatedAt time.Time              `json:"createdAt"`
	UpdatedAt time.Time              `json:"updatedAt"`
	Patient   MedicalRecordMiniPatient `json:"patient"`
	User      MedicalRecordMiniUser    `json:"user"`
}

type CreateMedicalRecordResponse struct {
	Message       string                `json:"message"`
	MedicalRecord MedicalRecordResponse `json:"medicalRecord"`
}

type PaginatedMedicalRecordsResponse struct {
	Data       []MedicalRecordResponse `json:"data"`
	Total      int                     `json:"total"`
	Page       int                     `json:"page"`
	Limit      int                     `json:"limit"`
	TotalPages int                     `json:"totalPages"`
}

type UpdateMedicalRecordResponse struct {
	Message       string         `json:"message"`
	UpdatedFields []UpdatedField `json:"updatedFields"`
}

type MessageDeleteMedicalRecordResponse struct {
	Message string `json:"message"`
}