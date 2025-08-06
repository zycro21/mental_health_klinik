package dto

import (
	"time"
)

type AppointmentResponse struct {
	ID         string              `json:"id"`
	PatientID  string              `json:"patientId"`
	UserID     string              `json:"userId"`
	ScheduleAt time.Time           `json:"scheduleAt"`
	Status     string              `json:"status"`
	Notes      string              `json:"notes"`
	CreatedAt  time.Time           `json:"createdAt"`
	UpdatedAt  time.Time           `json:"updatedAt"`
	Patient    PatientMiniResponse `json:"patient"`
	User       UserMiniResponse    `json:"user"`    
}

type CreateAppointmentResponse struct {
	Message     string              `json:"message"`
	Appointment AppointmentResponse `json:"appointment"`
}

type PaginatedAppointmentsResponse struct {
	Data       []AppointmentResponse `json:"data"`
	Total      int                   `json:"total"`
	Page       int                   `json:"page"`
	Limit      int                   `json:"limit"`
	TotalPages int                   `json:"totalPages"`
}

type UpdatedField struct {
	Field string      `json:"field"`
	Value interface{} `json:"value"`
}

type UpdateAppointmentResponse struct {
	Message       string          `json:"message"`
	UpdatedFields []UpdatedField  `json:"updatedFields"`
}

type AppointmentWithUserResponse struct {
	ID         string           `json:"id"`
	PatientID  string           `json:"patientId"`
	UserID     string           `json:"userId"`
	ScheduleAt time.Time        `json:"scheduleAt"`
	Status     string           `json:"status"` // 🔧 tambahkan ini
	Notes      string           `json:"notes"`
	CreatedAt  time.Time        `json:"createdAt"`
	UpdatedAt  time.Time        `json:"updatedAt"`
	User       UserMiniResponse `json:"user"` // 🔧 ubah dari struct anonymous jadi struct yang sudah ada
}

type AppointmentWithPatientResponse struct {
	ID          string                `json:"id"`
	PatientID   string                `json:"patientId"`
	UserID      string                `json:"userId"`
	Date        string                `json:"date"`
	Time        string                `json:"time"`
	Description string                `json:"description"`
	CreatedAt   string                `json:"createdAt"`
	UpdatedAt   string                `json:"updatedAt"`
	Patient     PatientMiniResponse   `json:"patient"`
}

