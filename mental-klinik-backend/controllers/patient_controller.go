package controllers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"mental-klinik-backend/databases"
	"mental-klinik-backend/dto"
	"mental-klinik-backend/models"
	"mental-klinik-backend/utils" 
)

// CreatePatient godoc
// @Summary Create a new patient
// @Description Register a new patient with full name, NIK, birth date, gender, phone, address, and emergency contact
// @Tags Patients
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body dto.CreatePatientRequest true "Patient input data"
// @Success 201 {object} dto.CreatePatientResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/patients [post]
func CreatePatient(c *gin.Context) {
	var input dto.CreatePatientRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	// Cek apakah NIK sudah terdaftar
	var existing models.Patient
	if err := database.DB.Where("nik = ?", input.NIK).First(&existing).Error; err != gorm.ErrRecordNotFound {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "NIK already registered"})
		return
	}

	// Generate ID custom
	count := int64(0)
	database.DB.Model(&models.Patient{}).Count(&count)
	newID := utils.GenerateCustomPatientID(int(count + 1))

	// Simpan ke database
	patient := models.Patient{
		ID:               newID,
		FullName:         input.FullName,
		NIK:              input.NIK,
		BirthDate:        input.BirthDate,
		Gender:           input.Gender,
		Phone:            input.Phone,
		Address:          input.Address,
		EmergencyContact: input.EmergencyContact,
	}

	if err := database.DB.Create(&patient).Error; err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to create patient"})
		return
	}

	// Response
	response := dto.CreatePatientResponse{
		Message: "Patient created successfully",
		Patient: dto.PatientResponse{
			ID:               patient.ID,
			FullName:         patient.FullName,
			NIK:              patient.NIK,
			BirthDate:        patient.BirthDate,
			Gender:           patient.Gender,
			Phone:            patient.Phone,
			Address:          patient.Address,
			EmergencyContact: patient.EmergencyContact,
		},
	}

	c.JSON(http.StatusCreated, response)
}

// GetAllPatients godoc
// @Summary Get all patients
// @Description Get paginated list of patients with optional search, gender filter, and sorting
// @Tags Patients
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param search query string false "Search by full name or NIK"
// @Param gender query string false "Filter by gender (male, female, other)"
// @Param sort query string false "Sort by field (e.g. full_name, created_at)" default(created_at)
// @Param order query string false "Sort order (asc or desc)" default(desc)
// @Success 200 {object} dto.PaginatedPatientsResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 403 {object} dto.ErrorResponse
// @Router /api/patients [get]
func GetAllPatients(c *gin.Context) {
	page := c.DefaultQuery("page", "1")
	limit := c.DefaultQuery("limit", "10")
	search := c.Query("search")
	gender := c.Query("gender")
	sort := c.DefaultQuery("sort", "created_at")
	order := c.DefaultQuery("order", "desc")

	pageInt, _ := strconv.Atoi(page)
	limitInt, _ := strconv.Atoi(limit)
	offset := (pageInt - 1) * limitInt

	var patients []models.Patient
	query := database.DB.Model(&models.Patient{})

	// Filtering
	if search != "" {
		query = query.Where("full_name ILIKE ? OR nik ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	if gender != "" {
		query = query.Where("gender = ?", gender)
	}

	// Sorting
	if sort != "" && (order == "asc" || order == "desc") {
		query = query.Order(fmt.Sprintf("%s %s", sort, order))
	}

	var total int64
	query.Count(&total)

	// Fetch paginated data
	query = query.Offset(offset).Limit(limitInt).Find(&patients)

	// Convert to DTO
	var responses []dto.PatientResponse
	for _, p := range patients {
		responses = append(responses, dto.PatientResponse{
			ID:               p.ID,
			FullName:         p.FullName,
			NIK:              p.NIK,
			BirthDate:        p.BirthDate,
			Gender:           p.Gender,
			Phone:            p.Phone,
			Address:          p.Address,
			EmergencyContact: p.EmergencyContact,
		})
	}

	c.JSON(http.StatusOK, dto.PaginatedPatientsResponse{
		Data:       responses,
		Total:      int(total),
		Page:       pageInt,
		Limit:      limitInt,
		TotalPages: int((total + int64(limitInt) - 1) / int64(limitInt)),
	})
}

// GetPatientByID godoc
// @Summary Get patient by ID
// @Description Retrieve detailed information of a patient by their ID
// @Tags Patients
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "Patient ID"
// @Success 200 {object} dto.PatientResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /api/patients/{id} [get]
func GetPatientByID(c *gin.Context) {
	id := c.Param("id")
	var patient models.Patient

	if err := database.DB.First(&patient, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Patient not found"})
		return
	}

	response := dto.PatientResponse{
		ID:               patient.ID,
		FullName:         patient.FullName,
		NIK:              patient.NIK,
		BirthDate:        patient.BirthDate,
		Gender:           patient.Gender,
		Phone:            patient.Phone,
		Address:          patient.Address,
		EmergencyContact: patient.EmergencyContact,
	}

	c.JSON(http.StatusOK, response)
}

// UpdatePatient godoc
// @Summary Update patient data
// @Description Update a patient’s information by ID. Only fields in the request body will be updated.
// @Tags Patients
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "Patient ID"
// @Param request body dto.UpdatePatientInput true "Patient fields to update"
// @Success 200 {object} dto.PatientResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/patients/{id} [put]
func UpdatePatient(c *gin.Context) {
	id := c.Param("id")
	var patient models.Patient

	if err := database.DB.First(&patient, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Patient not found"})
		return
	}

	var input dto.UpdatePatientInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	// Check if NIK is changing and already exists
	if input.NIK != "" && input.NIK != patient.NIK {
		var existing models.Patient
		if err := database.DB.Where("nik = ?", input.NIK).First(&existing).Error; err != gorm.ErrRecordNotFound {
			c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "NIK already used"})
			return
		}
		patient.NIK = input.NIK
	}

	// Update fields if provided
	if input.FullName != "" {
		patient.FullName = input.FullName
	}
	if input.BirthDate != "" {
		patient.BirthDate = input.BirthDate
	}
	if input.Gender != "" {
		patient.Gender = input.Gender
	}
	if input.Phone != "" {
		patient.Phone = input.Phone
	}
	if input.Address != "" {
		patient.Address = input.Address
	}
	if input.EmergencyContact != "" {
		patient.EmergencyContact = input.EmergencyContact
	}

	if err := database.DB.Save(&patient).Error; err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to update patient"})
		return
	}

	response := dto.PatientResponse{
		ID:               patient.ID,
		FullName:         patient.FullName,
		NIK:              patient.NIK,
		BirthDate:        patient.BirthDate,
		Gender:           patient.Gender,
		Phone:            patient.Phone,
		Address:          patient.Address,
		EmergencyContact: patient.EmergencyContact,
	}

	c.JSON(http.StatusOK, response)
}

// DeletePatient godoc
// @Summary Delete a patient
// @Description Delete a patient record by their ID. Only accessible by authorized roles.
// @Tags Patients
// @Security BearerAuth
// @Produce json
// @Param id path string true "Patient ID"
// @Success 200 {object} dto.MessageDeletePatientResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/patients/{id} [delete]
func DeletePatient(c *gin.Context) {
	id := c.Param("id")

	// Cek apakah patient ada dulu
	var patient models.Patient
	if err := database.DB.First(&patient, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Patient not found"})
		return
	}

	// Hapus soft delete
	if err := database.DB.Delete(&patient).Error; err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to delete patient"})
		return
	}

	c.JSON(http.StatusOK, dto.MessageDeletePatientResponse{Message: "Patient deleted successfully"})
}