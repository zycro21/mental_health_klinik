package dto

type UpdateUserInput struct {
	FullName string `json:"fullName"`
	Email    string `json:"email" binding:"omitempty,email"`
	Password string `json:"password" binding:"omitempty,min=6"`
	Role     string `json:"role" binding:"omitempty,oneof=admin doctor staff"`
}

// RegisterUserRequest defines input for register endpoint (untuk Swagger)
type RegisterUserRequest struct {
	FullName string `json:"fullName" example:"John Doe"`
	Email    string `json:"email" example:"john@example.com"`
	Password string `json:"password" example:"password123"`
	Role     string `json:"role" example:"admin"`
}

type LoginUserRequest struct {
	Email    string `json:"email" example:"user@example.com" binding:"required,email"`
	Password string `json:"password" example:"password123" binding:"required"`
}