package dto

import (
	"time"
)

type CreateAppointmentRequest struct {
	PatientID  string    `json:"patientId" binding:"required"`
	UserID     string    `json:"userId" binding:"required"`
	ScheduleAt time.Time `json:"scheduleAt" binding:"required"`
	Notes      string    `json:"notes"`
}

type UpdateAppointmentRequest struct {
	ScheduleAt *time.Time `json:"scheduleAt,omitempty"` // opsional
	Notes      *string    `json:"notes,omitempty"`      // opsional
}

type ChangeAppointmentStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=pending done cancelled"`
}