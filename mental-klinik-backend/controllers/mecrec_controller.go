package controllers

import (
	"mental-klinik-backend/databases"
	"mental-klinik-backend/models"
	"mental-klinik-backend/utils"
	"mental-klinik-backend/dto"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// CreateMedicalRecord godoc
// @Summary Create a new medical record
// @Description Adds a new medical record linked to a patient and user
// @Tags MedicalRecords
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param request body dto.CreateMedicalRecordRequest true "Medical Record input data"
// @Success 201 {object} dto.CreateMedicalRecordResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/medical-records [post]
func CreateMedicalRecord(c *gin.Context) {
	var input dto.CreateMedicalRecordRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	// Validasi Patient
	var patient models.Patient
	if err := database.DB.First(&patient, "id = ?", input.PatientID).Error; err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "Patient not found"})
		return
	}

	// Validasi User
	var user models.User
	if err := database.DB.First(&user, "id = ?", input.UserID).Error; err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "User not found"})
		return
	}

	// Generate custom ID
	var count int64
	database.DB.Model(&models.MedicalRecord{}).Count(&count)
	newID := utils.GenerateCustomMedicalRecordID(int(count + 1))

	record := models.MedicalRecord{
		ID:        newID,
		PatientID: input.PatientID,
		UserID:    input.UserID,
		Diagnosis: input.Diagnosis,
		Treatment: input.Treatment,
	}

	if err := database.DB.Create(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to create medical record"})
		return
	}

	c.JSON(http.StatusCreated, dto.CreateMedicalRecordResponse{
		Message: "Medical record created",
		MedicalRecord: dto.MedicalRecordResponse{
			ID:        record.ID,
			PatientID: record.PatientID,
			UserID:    record.UserID,
			Diagnosis: record.Diagnosis,
			Treatment: record.Treatment,
			CreatedAt: record.CreatedAt,
			UpdatedAt: record.UpdatedAt,
		},
	})
}

// GetAllMedicalRecords godoc
// @Summary Get all medical records (with pagination and optional filters)
// @Description Retrieve a paginated list of medical records. Supports filtering by patientId and userId.
// @Tags MedicalRecords
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param patientId query string false "Filter by patient ID"
// @Param userId query string false "Filter by user ID"
// @Success 200 {object} dto.PaginatedMedicalRecordsResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/medical-records [get]
func GetAllMedicalRecords(c *gin.Context) {
	page := ParseInt(c.Query("page"), 1)
	limit := ParseInt(c.Query("limit"), 10)
	offset := (page - 1) * limit

	var records []models.MedicalRecord
	query := database.DB.Preload("Patient").Preload("User")

	if pid := c.Query("patientId"); pid != "" {
		query = query.Where("patient_id = ?", pid)
	}
	if uid := c.Query("userId"); uid != "" {
		query = query.Where("user_id = ?", uid)
	}

	if err := query.Offset(offset).Limit(limit).Find(&records).Error; err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to retrieve medical records"})
		return
	}

	var total int64
	database.DB.Model(&models.MedicalRecord{}).Count(&total)

	var responses []dto.MedicalRecordResponse
	for _, record := range records {
		responses = append(responses, dto.MedicalRecordResponse{
			ID:        record.ID,
			PatientID: record.PatientID,
			UserID:    record.UserID,
			Diagnosis: record.Diagnosis,
			Treatment: record.Treatment,
			CreatedAt: record.CreatedAt,
			UpdatedAt: record.UpdatedAt,
			Patient: dto.MedicalRecordMiniPatient{
				ID:       record.Patient.ID,
				FullName: record.Patient.FullName,
			},
			User: dto.MedicalRecordMiniUser{
				ID:       record.User.ID,
				FullName: record.User.FullName,
				Role:     record.User.Role,
			},
		})
	}

	c.JSON(http.StatusOK, dto.PaginatedMedicalRecordsResponse{
		Data:       responses,
		Total:      int(total),
		Page:       page,
		Limit:      limit,
		TotalPages: int((total + int64(limit) - 1) / int64(limit)),
	})
}

// GetMedicalRecordByID godoc
// @Summary Get medical record by ID
// @Description Retrieve detailed information of a medical record by its ID, including patient and user (doctor/staff) info.
// @Tags MedicalRecords
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "Medical Record ID"
// @Success 200 {object} dto.MedicalRecordResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /api/medical-records/{id} [get]
func GetMedicalRecordByID(c *gin.Context) {
	id := c.Param("id")
	var record models.MedicalRecord

	if err := database.DB.Preload("Patient").Preload("User").First(&record, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Medical record not found"})
		return
	}

	response := dto.MedicalRecordResponse{
		ID:        record.ID,
		PatientID: record.PatientID,
		UserID:    record.UserID,
		Diagnosis: record.Diagnosis,
		Treatment: record.Treatment,
		CreatedAt: record.CreatedAt,
		UpdatedAt: record.UpdatedAt,
		Patient: dto.MedicalRecordMiniPatient{
			ID:       record.Patient.ID,
			FullName: record.Patient.FullName,
		},
		User: dto.MedicalRecordMiniUser{
			ID:       record.User.ID,
			FullName: record.User.FullName,
			Role:     record.User.Role,
		},
	}

	c.JSON(http.StatusOK, response)
}

// UpdateMedicalRecord godoc
// @Summary Update medical record by ID
// @Description Update a medical record's patient, user, diagnosis, or treatment.
// @Tags MedicalRecords
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "Medical Record ID"
// @Param data body dto.UpdateMedicalRecordRequest true "Medical Record Data"
// @Success 200 {object} dto.UpdateMedicalRecordResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/medical-records/{id} [put]
func UpdateMedicalRecord(c *gin.Context) {
	id := c.Param("id")
	var record models.MedicalRecord

	if err := database.DB.First(&record, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Medical record not found"})
		return
	}

	var input dto.UpdateMedicalRecordRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	var updatedFields []dto.UpdatedField

	if record.PatientID != input.PatientID {
		record.PatientID = input.PatientID
		updatedFields = append(updatedFields, dto.UpdatedField{
			Field: "patientId",
			Value: input.PatientID,
		})
	}
	if record.UserID != input.UserID {
		record.UserID = input.UserID
		updatedFields = append(updatedFields, dto.UpdatedField{
			Field: "userId",
			Value: input.UserID,
		})
	}
	if record.Diagnosis != input.Diagnosis {
		record.Diagnosis = input.Diagnosis
		updatedFields = append(updatedFields, dto.UpdatedField{
			Field: "diagnosis",
			Value: input.Diagnosis,
		})
	}
	if record.Treatment != input.Treatment {
		record.Treatment = input.Treatment
		updatedFields = append(updatedFields, dto.UpdatedField{
			Field: "treatment",
			Value: input.Treatment,
		})
	}

	if len(updatedFields) == 0 {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "No fields to update"})
		return
	}

	record.UpdatedAt = time.Now()
	if err := database.DB.Save(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to update medical record"})
		return
	}

	c.JSON(http.StatusOK, dto.UpdateMedicalRecordResponse{
		Message:       "Medical record updated",
		UpdatedFields: updatedFields,
	})
}

// DeleteMedicalRecord godoc
// @Summary Delete a medical record
// @Description Soft delete a medical record by its ID
// @Tags MedicalRecords
// @Security BearerAuth
// @Produce json
// @Param id path string true "Medical Record ID"
// @Success 200 {object} dto.MessageDeleteMedicalRecordResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/medical-records/{id} [delete]
func DeleteMedicalRecord(c *gin.Context) {
	id := c.Param("id")
	var record models.MedicalRecord

	if err := database.DB.First(&record, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Medical record not found"})
		return
	}

	if err := database.DB.Delete(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to delete medical record"})
		return
	}

	c.JSON(http.StatusOK, dto.MessageDeleteMedicalRecordResponse{Message: "Medical record deleted successfully"})
}
