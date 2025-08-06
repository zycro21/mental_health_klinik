package dto

// import "mental-klinik-backend/models"

type UserResponse struct {
	ID       string `json:"id" example:"admin-001-a1b2c3d4"`
	FullName string `json:"fullName" example:"John Doe"`
	Email    string `json:"email" example:"john@example.com"`
	Role     string `json:"role" example:"admin"`
	// CreatedAt, etc. jika perlu
}

type RegisterUserResponse struct {
	Message string       `json:"message" example:"User Registered"`
	User    UserResponse `json:"user"`
}

type LoginResponse struct {
	Token string `json:"token" example:"jwt-token"`
	Email string `json:"email" example:"john@example.com"`
	Role  string `json:"role" example:"admin"`
}

type PaginatedUsersResponse struct {
	Data       []UserResponse `json:"data"`
	Total      int            `json:"total" example:"100"`
	Page       int            `json:"page" example:"1"`
	Limit      int            `json:"limit" example:"10"`
	TotalPages int            `json:"totalPages" example:"10"`
}

type UserMiniResponse struct {
	ID       string `json:"id"`
	FullName string `json:"fullName"`
	Role     string `json:"role"`
	Email    string `json:"email"` // 🔧 optional: jika kamu ingin tampilkan email juga
}

type MedicalRecordMiniUser struct {
	ID       string `json:"id"`
	FullName string `json:"fullName"`
	Role     string `json:"role"`
}