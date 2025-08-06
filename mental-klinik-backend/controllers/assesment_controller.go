package controllers

import (
	"encoding/json"
	"net/http"
	"time"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"

	"mental-klinik-backend/databases"
	"mental-klinik-backend/dto"
	"mental-klinik-backend/models"
	"mental-klinik-backend/utils"
)

// @Summary Buat assessment baru
// @Description Membuat data assessment baru untuk pasien tertentu
// @Tags Assessments
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.CreateAssessmentRequest true "Data assessment baru"
// @Success 201 {object} dto.CreateAssessmentSuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/assessments [post]
func CreateAssessment(c *gin.Context) {
	var req dto.CreateAssessmentRequest

	// Validasi body
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	// Marshal jawaban ke datatypes.JSON (tipe []byte)
	jsonAnswers := datatypes.JSON(utils.MarshalToJSON(req.Answers))

	// Buat objek assessment
	assessment := models.Assessment{
		ID:        utils.GenerateCustomAssessmentID(1),
		PatientID: req.PatientID,
		Date:      req.Date,
		Answers:   jsonAnswers,
	}

	// Simpan ke database
	if err := database.DB.Create(&assessment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Gagal membuat assessment"})
		return
	}

	// Uraikan jawaban assessment ke map[string]interface{} agar bisa dikirim sebagai respons
	var answersMap map[string]interface{}
	if err := json.Unmarshal(assessment.Answers, &answersMap); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Gagal menguraikan jawaban assessment"})
		return
	}

	// Kirim respons
	c.JSON(http.StatusCreated, dto.CreateAssessmentSuccessResponse{
		Message: "Assessment berhasil dibuat",
		Data: dto.AssessmentResponse{
			ID:        assessment.ID,
			PatientID: assessment.PatientID,
			Date:      assessment.Date,
			Answers:   answersMap, // Sudah berupa map[string]interface{}
			CreatedAt: assessment.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			UpdatedAt: assessment.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		},
	})
}

// GetAllAssessments godoc
// @Summary Get all assessments
// @Description Get paginated list of assessments, with optional filter by patient ID
// @Tags Assessments
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param patientId query string false "Filter by patient ID"
// @Success 200 {object} dto.PaginatedAssessmentsResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 403 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/assessments [get]
func GetAllAssessments(c *gin.Context) {
	var assessments []models.Assessment
	var total int64

	patientId := c.Query("patientId")
	page := c.DefaultQuery("page", "1")
	limit := c.DefaultQuery("limit", "10")

	pageInt := ParseInt(page, 1)
	limitInt := ParseInt(limit, 10)
	offset := (pageInt - 1) * limitInt

	tx := database.DB.Model(&models.Assessment{}).Preload("Patient").Preload("Prediction")

	if patientId != "" {
		tx = tx.Where("patient_id = ?", patientId)
	}

	if err := tx.Count(&total).Limit(limitInt).Offset(offset).Order("created_at DESC").Find(&assessments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Gagal mengambil data assessment"})
		return
	}

	// Mapping ke DTO
	var responses []dto.AssessmentResponse
	for _, a := range assessments {
		var prediction *dto.PredictionResponse
		if a.Prediction != nil {
			prediction = &dto.PredictionResponse{
				ID:               a.Prediction.ID,
				AssessmentID:     a.Prediction.AssessmentID,
				ResultLabel:      a.Prediction.ResultLabel,
				ProbabilityScore: a.Prediction.ProbabilityScore,
			}
		}

		// Unmarshal JSON ke map
		var answersMap map[string]interface{}
		if err := json.Unmarshal(a.Answers, &answersMap); err != nil {
			c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Gagal menguraikan jawaban assessment"})
			return
		}

		responses = append(responses, dto.AssessmentResponse{
			ID:        a.ID,
			PatientID: a.PatientID,
			Date:      a.Date,
			Answers:   answersMap,
			CreatedAt: a.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			UpdatedAt: a.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
			Patient: dto.PatientMiniResponse{
				ID:       a.Patient.ID,
				FullName: a.Patient.FullName,
			},
			Prediction: prediction,
		})
	}

	c.JSON(http.StatusOK, dto.PaginatedAssessmentsResponse{
		Data:       responses,
		Total:      int(total),
		Page:       pageInt,
		Limit:      limitInt,
		TotalPages: int((total + int64(limitInt) - 1) / int64(limitInt)),
	})
}

// GetAssessmentByID godoc
// @Summary Mendapatkan assessment berdasarkan ID
// @Description Mengambil detail satu assessment berdasarkan ID, termasuk data pasien (mini) dan hasil prediksi jika ada
// @Tags Assessments
// @Security BearerAuth
// @Param id path string true "Assessment ID"
// @Produce json
// @Success 200 {object} dto.GetAssessmentByIDSuccessResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /api/assessments/{id} [get]
func GetAssessmentByID(c *gin.Context) {
	id := c.Param("id")
	var assessment models.Assessment

	if err := database.DB.
		Preload("Patient").
		Preload("Prediction").
		First(&assessment, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Assessment tidak ditemukan"})
		return
	}

	// Unmarshal datatypes.JSON ke map[string]interface{}
	var answersMap map[string]interface{}
	if err := json.Unmarshal(assessment.Answers, &answersMap); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Gagal menguraikan jawaban assessment"})
		return
	}

	response := dto.AssessmentResponse{
		ID:        assessment.ID,
		PatientID: assessment.PatientID,
		Date:      assessment.Date,
		Answers:   answersMap, // pakai hasil unmarshal
		CreatedAt: assessment.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt: assessment.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		Patient: dto.PatientMiniResponse{
			ID:        assessment.Patient.ID,
			FullName:  assessment.Patient.FullName,
			Gender:    assessment.Patient.Gender,
			BirthDate: assessment.Patient.BirthDate,
		},
	}

	if assessment.Prediction != nil {
		response.Prediction = &dto.PredictionResponse{
			ID:               assessment.Prediction.ID,
			AssessmentID:     assessment.Prediction.AssessmentID,
			ResultLabel:      assessment.Prediction.ResultLabel,
			ProbabilityScore: assessment.Prediction.ProbabilityScore,
		}
	}

	c.JSON(http.StatusOK, dto.GetAssessmentByIDSuccessResponse{
		Data: response,
	})
}

// UpdateAssessment godoc
// @Summary Memperbarui assessment berdasarkan ID
// @Description Memperbarui tanggal dan jawaban assessment, serta memperbarui waktu terakhir diperbarui (updatedAt)
// @Tags Assessments
// @Accept json
// @Produce json
// @Param id path string true "ID Assessment"
// @Param body body dto.UpdateAssessmentRequest true "Data assessment yang diperbarui"
// @Success 200 {object} dto.UpdateAssessmentSuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /api/assessments/{id} [put]
// @Security BearerAuth
func UpdateAssessment(c *gin.Context) {
	id := c.Param("id")
	var req dto.UpdateAssessmentRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	var assessment models.Assessment
	if err := database.DB.First(&assessment, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Assessment tidak ditemukan"})
		return
	}

	// Update field
	assessment.Date = req.Date
	assessment.Answers = utils.MarshalToJSON(req.Answers)
	assessment.UpdatedAt = time.Now()

	if err := database.DB.Save(&assessment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Gagal mengupdate assessment"})
		return
	}

	// Unmarshal untuk response
	var answersMap map[string]interface{}
	if err := json.Unmarshal(assessment.Answers, &answersMap); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Gagal menguraikan jawaban assessment"})
		return
	}

	c.JSON(http.StatusOK, dto.UpdateAssessmentSuccessResponse{
		Message: "Assessment berhasil diperbarui",
		Data: dto.AssessmentUpdateResponse{
			ID:        assessment.ID,
			Date:      assessment.Date.Format(time.RFC3339),
			Answers:   answersMap,
			UpdatedAt: assessment.UpdatedAt.Format(time.RFC3339),
		},
	})
}

// DeleteAssessment godoc
// @Summary Menghapus assessment berdasarkan ID
// @Description Menghapus assessment dari database berdasarkan ID yang diberikan
// @Tags Assessments
// @Security BearerAuth
// @Param id path string true "Assessment ID"
// @Success 200 {object} dto.MessageDeleteAssesmentResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/assessments/{id} [delete]
func DeleteAssessment(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.Assessment{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Gagal menghapus assessment"})
		return
	}
	c.JSON(http.StatusOK, dto.MessageDeleteAssesmentResponse{Message: "Assessment berhasil dihapus"})
}

// GetAssessmentsByPatientID godoc
// @Summary Mendapatkan semua assessment berdasarkan ID pasien
// @Description Mengambil semua data assessment yang dimiliki oleh pasien tertentu, termasuk hasil prediksi jika tersedia
// @Tags Assessments
// @Security BearerAuth
// @Param patientId path string true "Patient ID"
// @Produce json
// @Success 200 {array} dto.AssessmentResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/assessments/patient/{patientId} [get]
func GetAssessmentsByPatientID(c *gin.Context) {
	patientId := c.Param("patientId")
	var assessments []models.Assessment

	// Ambil semua assessment + relasi prediction + relasi patient
	if err := database.DB.Preload("Prediction").Preload("Patient").
		Where("patient_id = ?", patientId).Find(&assessments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error: "Gagal mengambil assessment pasien",
		})
		return
	}

	var responses []dto.AssessmentResponse
	for _, a := range assessments {
		// Unmarshal Answers (JSON -> map[string]interface{})
		var answersMap map[string]interface{}
		if err := json.Unmarshal(a.Answers, &answersMap); err != nil {
			c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error: "Gagal menguraikan jawaban assessment",
			})
			return
		}

		var prediction *dto.PredictionResponse
		if a.Prediction != nil {
			prediction = &dto.PredictionResponse{
				ID:               a.Prediction.ID,
				AssessmentID:     a.Prediction.AssessmentID,
				ResultLabel:      a.Prediction.ResultLabel,
				ProbabilityScore: a.Prediction.ProbabilityScore,
			}
		}

		responses = append(responses, dto.AssessmentResponse{
			ID:        a.ID,
			PatientID: a.PatientID,
			Date:      a.Date,
			Answers:   answersMap, // sudah dikonversi
			CreatedAt: a.CreatedAt.Format(time.RFC3339),
			UpdatedAt: a.UpdatedAt.Format(time.RFC3339),
			Patient: dto.PatientMiniResponse{
				ID:        a.Patient.ID,
				FullName:  a.Patient.FullName,
				Gender:    a.Patient.Gender,
				BirthDate: a.Patient.BirthDate,
			},
			Prediction: prediction,
		})
	}

	c.JSON(http.StatusOK, responses)
}

// ParseInt helper
func ParseInt(s string, fallback int) int {
	val, err := strconv.Atoi(s)
	if err != nil {
		return fallback
	}
	return val
}
