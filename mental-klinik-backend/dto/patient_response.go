package dto

type PatientResponse struct {
	ID               string `json:"id" example:"patient-001-ABC12345"`
	FullName         string `json:"fullName" example:"Andi Saputra"`
	NIK              string `json:"nik" example:"3201012345678900"`
	BirthDate        string `json:"birthDate" example:"2000-01-01"`
	Gender           string `json:"gender" example:"male"`
	Phone            string `json:"phone" example:"08123456789"`
	Address          string `json:"address" example:"Jl. Merdeka No. 10"`
	EmergencyContact string `json:"emergencyContact" example:"08198765432"`
}

type CreatePatientResponse struct {
	Message string          `json:"message" example:"Patient created successfully"`
	Patient PatientResponse `json:"patient"`
}

type PaginatedPatientsResponse struct {
	Data       []PatientResponse `json:"data"`
	Total      int               `json:"total" example:"100"`
	Page       int               `json:"page" example:"1"`
	Limit      int               `json:"limit" example:"10"`
	TotalPages int               `json:"totalPages" example:"10"`
}

type PatientMiniResponse struct {
	ID        string `json:"id"`
	FullName  string `json:"fullName"`
	Gender    string `json:"gender"`
	BirthDate string `json:"birthDate"`
}

type MedicalRecordMiniPatient struct {
	ID       string `json:"id"`
	FullName string `json:"fullName"`
}