package dto

type CreatePatientRequest struct {
	FullName         string `json:"fullName" binding:"required" example:"Andi Saputra"`
	NIK              string `json:"nik" binding:"required" example:"3201012345678900"`
	BirthDate        string `json:"birthDate" binding:"required" example:"2000-01-01"`
	Gender           string `json:"gender" binding:"required,oneof=male female other" example:"male"`
	Phone            string `json:"phone" binding:"required" example:"08123456789"`
	Address          string `json:"address" binding:"required" example:"Jl. Merdeka No. 10"`
	EmergencyContact string `json:"emergencyContact" binding:"required" example:"08198765432"`
}

type UpdatePatientInput struct {
	FullName         string `json:"fullName" example:"Budi Santoso"`
	NIK              string `json:"nik" example:"3201012345678901"`
	BirthDate        string `json:"birthDate" example:"1980-12-31"`
	Gender           string `json:"gender" example:"male"`
	Phone            string `json:"phone" example:"081234567891"`
	Address          string `json:"address" example:"Jl. Merpati No. 123"`
	EmergencyContact string `json:"emergencyContact" example:"081987654321"`
}