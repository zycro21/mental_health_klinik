package controllers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"mental-klinik-backend/databases"
	"mental-klinik-backend/dto"
	"mental-klinik-backend/models"
	"mental-klinik-backend/utils"

	"github.com/gin-gonic/gin"
	// "gorm.io/gorm"
)

// CreateAppointment godoc
// @Summary Create a new appointment
// @Description Create a new appointment between patient and doctor/staff.
// @Tags Appointments
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body dto.CreateAppointmentRequest true "Appointment input data"
// @Success 201 {object} dto.CreateAppointmentResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/appointments [post]
func CreateAppointment(c *gin.Context) {
	var input dto.CreateAppointmentRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	// Validasi keberadaan Patient dan User
	var patient models.Patient
	if err := database.DB.First(&patient, "id = ?", input.PatientID).Error; err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "Patient not found"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, "id = ?", input.UserID).Error; err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "User not found"})
		return
	}

	// Generate ID
	var count int64
	database.DB.Model(&models.Appointment{}).Count(&count)
	newID := utils.GenerateCustomAppointmentID(int(count + 1))

	appointment := models.Appointment{
		ID:         newID,
		PatientID:  input.PatientID,
		UserID:     input.UserID,
		ScheduleAt: input.ScheduleAt,
		Status:     "pending",
		Notes:      input.Notes,
	}

	if err := database.DB.Create(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to create appointment"})
		return
	}

	c.JSON(http.StatusCreated, dto.CreateAppointmentResponse{
		Message: "Appointment created",
		Appointment: dto.AppointmentResponse{
			ID:         appointment.ID,
			PatientID:  appointment.PatientID,
			UserID:     appointment.UserID,
			ScheduleAt: appointment.ScheduleAt,
			Status:     appointment.Status,
			Notes:      appointment.Notes,
			CreatedAt:  appointment.CreatedAt,
			UpdatedAt:  appointment.UpdatedAt,
		},
	})
}

// GetAllAppointments godoc
// @Summary Get all appointments
// @Description Get paginated list of appointments with optional search (by patient name), status filter, and sorting.
// @Tags Appointments
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param search query string false "Search by patient full name"
// @Param status query string false "Filter by status (pending, done, cancelled)"
// @Param sort query string false "Sort by field (e.g. schedule_at, created_at)" default(schedule_at)
// @Param order query string false "Sort order (asc or desc)" default(asc)
// @Success 200 {object} dto.PaginatedAppointmentsResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 403 {object} dto.ErrorResponse
// @Router /api/appointments [get]
func GetAllAppointments(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")
	search := c.Query("search")
	status := c.Query("status")
	sort := c.DefaultQuery("sort", "schedule_at")
	order := c.DefaultQuery("order", "asc")

	page, _ := strconv.Atoi(pageStr)
	limit, _ := strconv.Atoi(limitStr)
	offset := (page - 1) * limit

	var appointments []models.Appointment
	query := database.DB.Preload("Patient").Preload("User")

	if search != "" {
		query = query.Joins("JOIN patients ON patients.id = appointments.patient_id").
			Where("patients.full_name ILIKE ?", "%"+search+"%")
	}

	if status != "" {
		query = query.Where("appointments.status = ?", status)
	}

	query.Order(fmt.Sprintf("%s %s", sort, order)).
		Offset(offset).
		Limit(limit).
		Find(&appointments)

	var total int64
	database.DB.Model(&models.Appointment{}).Count(&total)

	// Convert ke DTO
	var responses []dto.AppointmentResponse
	for _, a := range appointments {
		responses = append(responses, dto.AppointmentResponse{
			ID:         a.ID,
			PatientID:  a.PatientID,
			UserID:     a.UserID,
			ScheduleAt: a.ScheduleAt,
			Status:     a.Status,
			Notes:      a.Notes,
			Patient: dto.PatientMiniResponse{
				ID:       a.Patient.ID,
				FullName: a.Patient.FullName,
			},
			User: dto.UserMiniResponse{
				ID:       a.User.ID,
				FullName: a.User.FullName,
				Role:     a.User.Role,
			},
		})
	}

	c.JSON(http.StatusOK, dto.PaginatedAppointmentsResponse{
		Data:       responses,
		Total:      int(total),
		Page:       page,
		Limit:      limit,
		TotalPages: int((total + int64(limit) - 1) / int64(limit)),
	})
}

// GetAppointmentByID godoc
// @Summary Get appointment by ID
// @Description Retrieve detailed information of an appointment by its ID, including patient and doctor/staff info.
// @Tags Appointments
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "Appointment ID"
// @Success 200 {object} dto.AppointmentResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /api/appointments/{id} [get]
func GetAppointmentByID(c *gin.Context) {
	id := c.Param("id")
	var appointment models.Appointment

	if err := database.DB.Preload("Patient").Preload("User").
		First(&appointment, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Appointment not found"})
		return
	}

	response := dto.AppointmentResponse{
		ID:         appointment.ID,
		PatientID:  appointment.PatientID,
		UserID:     appointment.UserID,
		ScheduleAt: appointment.ScheduleAt,
		Status:     appointment.Status,
		Notes:      appointment.Notes,
		CreatedAt:  appointment.CreatedAt,
		UpdatedAt:  appointment.UpdatedAt,
		Patient: dto.PatientMiniResponse{
			ID:       appointment.Patient.ID,
			FullName: appointment.Patient.FullName,
		},
		User: dto.UserMiniResponse{
			ID:       appointment.User.ID,
			FullName: appointment.User.FullName,
			Role:     appointment.User.Role,
		},
	}

	c.JSON(http.StatusOK, response)
}

// UpdateAppointment godoc
// @Summary Update an appointment
// @Description Update appointment schedule or notes by ID.
// @Tags Appointments
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "Appointment ID"
// @Param request body dto.UpdateAppointmentRequest true "Updated appointment data"
// @Success 200 {object} dto.UpdateAppointmentResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/appointments/{id} [put]
func UpdateAppointment(c *gin.Context) {
	id := c.Param("id")
	var appointment models.Appointment

	if err := database.DB.First(&appointment, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Appointment not found"})
		return
	}

	var input dto.UpdateAppointmentRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	var updatedFields []dto.UpdatedField

	if input.ScheduleAt != nil {
		appointment.ScheduleAt = *input.ScheduleAt
		updatedFields = append(updatedFields, dto.UpdatedField{
			Field: "scheduleAt",
			Value: input.ScheduleAt,
		})
	}
	if input.Notes != nil {
		appointment.Notes = *input.Notes
		updatedFields = append(updatedFields, dto.UpdatedField{
			Field: "notes",
			Value: input.Notes,
		})
	}

	if len(updatedFields) == 0 {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "No fields to update"})
		return
	}

	if err := database.DB.Save(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to update appointment"})
		return
	}

	c.JSON(http.StatusOK, dto.UpdateAppointmentResponse{
		Message:       "Appointment updated",
		UpdatedFields: updatedFields,
	})
}

// DeleteAppointment godoc
// @Summary Delete an appointment
// @Description Delete an appointment by its ID
// @Tags Appointments
// @Security BearerAuth
// @Produce json
// @Param id path string true "Appointment ID"
// @Success 200 {object} dto.MessageDeleteAppointmentResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/appointments/{id} [delete]
func DeleteAppointment(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.Appointment{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to delete appointment"})
		return
	}

	c.JSON(http.StatusOK, dto.MessageDeleteAppointmentResponse{Message: "Appointment deleted successfully"})
}

// GetAppointmentsByPatientID godoc
// @Summary Get appointments by patient ID
// @Description Mengambil semua janji temu berdasarkan ID pasien, beserta informasi pasien yang terkait
// @Tags Appointments
// @Param patientId path string true "Patient ID"
// @Produce json
// @Success 200 {array} dto.AppointmentWithPatientResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/appointments/appointmentPatient/{patientId} [get]
func GetAppointmentsByPatientID(c *gin.Context) {
	patientID := c.Param("patientId")
	var appointments []models.Appointment

	// Preload Patient untuk menampilkan info mini pasien
	if err := database.DB.Preload("Patient").
		Where("patient_id = ?", patientID).Find(&appointments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to fetch appointments",
		})
		return
	}

	var response []dto.AppointmentWithPatientResponse
	for _, a := range appointments {
		response = append(response, dto.AppointmentWithPatientResponse{
			ID:          a.ID,
			PatientID:   a.PatientID,
			UserID:      a.UserID,
			Date:        a.ScheduleAt.Format("2006-01-02"), // Format tanggal
			Time:        a.ScheduleAt.Format("15:04"),       // Format jam
			Description: a.Notes,
			CreatedAt:   a.CreatedAt.Format(time.RFC3339),
			UpdatedAt:   a.UpdatedAt.Format(time.RFC3339),
			Patient: dto.PatientMiniResponse{
				ID:        a.Patient.ID,
				FullName:  a.Patient.FullName,
				Gender:    a.Patient.Gender,
				BirthDate: a.Patient.BirthDate,
			},
		})
	}

	c.JSON(http.StatusOK, response)
}

// GetAppointmentsByUserID godoc
// @Summary Get appointments by user ID
// @Description Mengambil semua janji temu berdasarkan ID user (dokter/staff), beserta informasi user yang membuat janji temu
// @Tags Appointments
// @Param userId path string true "User ID"
// @Produce json
// @Success 200 {array} dto.AppointmentWithUserResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/appointments/appoinmentUser/{userId} [get]
func GetAppointmentsByUserID(c *gin.Context) {
	userID := c.Param("userId")
	var appointments []models.Appointment

	// Preload User karena kita mau info user (bukan patient)
	if err := database.DB.Preload("User").
		Where("user_id = ?", userID).Find(&appointments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Failed to fetch appointments",
		})
		return
	}

	var responses []dto.AppointmentWithUserResponse
	for _, a := range appointments {
		responses = append(responses, dto.AppointmentWithUserResponse{
			ID:         a.ID,
			PatientID:  a.PatientID,
			UserID:     a.UserID,
			ScheduleAt: a.ScheduleAt,
			Status:     a.Status,
			Notes:      a.Notes,
			CreatedAt:  a.CreatedAt,
			UpdatedAt:  a.UpdatedAt,
			User: dto.UserMiniResponse{
				ID:       a.User.ID,
				FullName: a.User.FullName,
				Role:     a.User.Role,
				Email:    a.User.Email,
			},
		})
	}

	c.JSON(http.StatusOK, responses)
}

// ChangeAppointmentStatus godoc
// @Summary Ubah status janji temu
// @Description Ubah status janji temu berdasarkan ID appointment menjadi pending, done, atau cancelled
// @Tags Appointments
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "Appointment ID"
// @Param body body dto.ChangeAppointmentStatusRequest true "Status janji temu baru"
// @Success 200 {object} dto.MessageUpdateStatusAppoinmentResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/appointments/{id}/statusAppoinment [patch]
func ChangeAppointmentStatus(c *gin.Context) {
	id := c.Param("id")

	var body dto.ChangeAppointmentStatusRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	var appointment models.Appointment
	if err := database.DB.First(&appointment, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Appointment not found"})
		return
	}

	appointment.Status = body.Status
	if err := database.DB.Save(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to change status"})
		return
	}

	c.JSON(http.StatusOK, dto.MessageUpdateStatusAppoinmentResponse{Message: "Status updated"})
}
