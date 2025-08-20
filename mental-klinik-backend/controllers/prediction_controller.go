package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
	"io"

	"errors"
	"gorm.io/gorm"

	"mental-klinik-backend/databases"
	"mental-klinik-backend/dto"
	"mental-klinik-backend/models"
	// "mental-klinik-backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// PredictMentalHealth godoc
// @Summary Membuat prediksi kesehatan mental dari assessment
// @Description Mengirim data assessment ke model ML, lalu menyimpan hasil prediksi ke database
// @Tags Predictions
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Assessment ID"
// @Success 201 {object} dto.PredictionResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/predictions/{id} [post]
func PredictMentalHealth(c *gin.Context) {
	assessmentID := c.Param("id")

	// Cek apakah assessment ada
	var assessment models.Assessment
	if err := database.DB.Preload("Patient").First(&assessment, "id = ?", assessmentID).Error; err != nil {
		fmt.Println("DB error:", err)
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Assessment tidak ditemukan"})
		return
	}

	// Decode jawaban ke dalam struct
	var answers dto.AssessmentAnswers
	err := json.Unmarshal(assessment.Answers, &answers)
	if err != nil {
		fmt.Println("Unmarshal error:", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Gagal decode data jawaban assessment"})
		return
	}

	// Kirim data ke model Python
	payload := map[string]interface{}{
		"schizophrenia_share":   answers.SchizophreniaShare,
		"anxiety_share":         answers.AnxietyShare,
		"bipolar_share":         answers.BipolarShare,
		"eating_disorder_share": answers.EatingDisorderShare,
		"DALYs":                 answers.DALYs,
		"suicide_rate":          answers.SuicideRate,
		"depression_dalys":      answers.DepressionDALYs,
		"schizophrenia_dalys":   answers.SchizophreniaDALYs,
		"bipolar_dalys":         answers.BipolarDALYs,
		"eating_dalys":          answers.EatingDALYs,
		"anxiety_dalys":         answers.AnxietyDALYs,
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Gagal mempersiapkan data prediksi"})
		return
	}

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Post("http://localhost:8000/predict", "application/json", bytes.NewBuffer(payloadBytes))
	if err != nil {
		fmt.Println("HTTP error:", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Gagal menghubungi service prediksi"})
		return
	}
	defer resp.Body.Close()

	// Baca body sekali saja
	bodyBytes, _ := io.ReadAll(resp.Body)
	fmt.Println("ML response raw:", string(bodyBytes))

	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Service prediksi mengembalikan status error"})
		return
	}

	var predictionResult struct {
		ResultLabel      string  `json:"resultLabel"`
		ProbabilityScore float64 `json:"probabilityScore"`
	}
	if err := json.Unmarshal(bodyBytes, &predictionResult); err != nil {
		fmt.Println("Decode error:", err)
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Gagal membaca hasil prediksi"})
		return
	}

	// Simpan hasil prediksi
	prediction := models.Prediction{
		ID:               uuid.New().String(),
		AssessmentID:     assessmentID,
		ResultLabel:      predictionResult.ResultLabel,
		ProbabilityScore: predictionResult.ProbabilityScore,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	if err := database.DB.Create(&prediction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Gagal menyimpan hasil prediksi"})
		return
	}

	// Response
	response := dto.PredictionResponse{
		ID:               prediction.ID,
		AssessmentID:     prediction.AssessmentID,
		ResultLabel:      prediction.ResultLabel,
		ProbabilityScore: prediction.ProbabilityScore,
		CreatedAt:        prediction.CreatedAt,
	}

	c.JSON(http.StatusCreated, response)
}

// GetAllPredictions godoc
// @Summary Get all predictions
// @Description Get paginated list of predictions, with optional filters and sorting
// @Tags Predictions
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param resultLabel query string false "Filter by result label"
// @Param sortBy query string false "Sort by field (e.g. created_at, probability_score)" default(created_at)
// @Param sortOrder query string false "Sort order: asc or desc" default(desc)
// @Success 200 {object} dto.PaginatedPredictionsResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 403 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/predictions [get]
func GetAllPredictions(c *gin.Context) {
	page := ParseInt(c.DefaultQuery("page", "1"), 1)
	limit := ParseInt(c.DefaultQuery("limit", "10"), 10)
	offset := (page - 1) * limit

	sortBy := c.DefaultQuery("sortBy", "created_at")
	sortOrder := c.DefaultQuery("sortOrder", "desc")
	resultLabel := c.Query("resultLabel") // optional filter

	var total int64
	var predictions []models.Prediction

	query := database.DB.Model(&models.Prediction{})

	if resultLabel != "" {
		query = query.Where("result_label = ?", resultLabel)
	}

	query.Count(&total)

	if err := query.Order(fmt.Sprintf("%s %s", sortBy, sortOrder)).
		Limit(limit).Offset(offset).
		Find(&predictions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Gagal mengambil data prediksi"})
		return
	}

	var response []dto.PredictionResponse
	for _, p := range predictions {
		response = append(response, dto.PredictionResponse{
			ID:               p.ID,
			AssessmentID:     p.AssessmentID,
			ResultLabel:      p.ResultLabel,
			ProbabilityScore: p.ProbabilityScore,
			CreatedAt:        p.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, dto.PaginatedPredictionsResponse{
		Data:       response,
		Total:      int(total),
		Page:       page,
		Limit:      limit,
		TotalPages: int((total + int64(limit) - 1) / int64(limit)),
	})
}

// GetPredictionByID godoc
// @Summary Get prediction by ID
// @Description Ambil hasil prediksi berdasarkan prediction ID
// @Tags Predictions
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "Prediction ID"
// @Success 200 {object} dto.PredictionResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/predictions/{id} [get]
func GetPredictionByID(c *gin.Context) {
	id := c.Param("id")

	var prediction models.Prediction
	if err := database.DB.First(&prediction, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Prediksi tidak ditemukan"})
		return
	}

	response := dto.PredictionResponse{
		ID:               prediction.ID,
		AssessmentID:     prediction.AssessmentID,
		ResultLabel:      prediction.ResultLabel,
		ProbabilityScore: prediction.ProbabilityScore,
		CreatedAt:        prediction.CreatedAt,
	}

	c.JSON(http.StatusOK, response)
}

// GetPredictionByAssessmentID godoc
// @Summary Get prediction by assessment ID
// @Description Ambil hasil prediksi berdasarkan assessment ID
// @Tags Predictions
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param assessment_id path string true "Assessment ID"
// @Success 200 {object} dto.PredictionResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/predictions/assessment/{assessment_id} [get]
func GetPredictionByAssessmentID(c *gin.Context) {
	assessmentID := c.Param("assessment_id")
	if assessmentID == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "Assessment ID wajib diisi"})
		return
	}

	var prediction models.Prediction
	err := database.DB.Where("assessment_id = ?", assessmentID).First(&prediction).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Prediksi untuk assessment ini tidak ditemukan"})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Gagal mengambil data prediksi"})
		return	
	}

	response := dto.PredictionResponse{
		ID:               prediction.ID,
		AssessmentID:     prediction.AssessmentID,
		ResultLabel:      prediction.ResultLabel,
		ProbabilityScore: prediction.ProbabilityScore,
		CreatedAt:        prediction.CreatedAt,
	}

	c.JSON(http.StatusOK, response)
}

// UpdatePredictionByID godoc
// @Summary Update prediksi berdasarkan ID
// @Description Memperbarui data prediksi (result label dan skor probabilitas) berdasarkan ID
// @Tags Predictions
// @Security BearerAuth
// @Param id path string true "Prediction ID"
// @Accept json
// @Produce json
// @Param request body dto.UpdatePredictionRequest true "Data prediksi yang diperbarui"
// @Success 200 {object} dto.PredictionResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/predictions/{id} [put]
func UpdatePredictionByID(c *gin.Context) {
	id := c.Param("id")

	var req dto.UpdatePredictionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "Data input tidak valid"})
		return
	}

	var prediction models.Prediction
	if err := database.DB.First(&prediction, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Prediksi tidak ditemukan"})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Gagal mengambil data prediksi"})
		return
	}

	// Update field
	prediction.ResultLabel = req.ResultLabel
	prediction.ProbabilityScore = req.ProbabilityScore

	if err := database.DB.Save(&prediction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Gagal memperbarui prediksi"})
		return
	}

	response := dto.PredictionResponse{
		ID:               prediction.ID,
		AssessmentID:     prediction.AssessmentID,
		ResultLabel:      prediction.ResultLabel,
		ProbabilityScore: prediction.ProbabilityScore,
		UpdatedAt:        prediction.UpdatedAt,
	}

	c.JSON(http.StatusOK, response)
}

// DeletePredictionByID godoc
// @Summary Menghapus prediksi berdasarkan ID
// @Description Menghapus data prediksi dari database berdasarkan ID yang diberikan
// @Tags Predictions
// @Security BearerAuth
// @Param id path string true "Prediction ID"
// @Success 200 {object} dto.MessageDeletePredictionResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/predictions/{id} [delete]
func DeletePredictionByID(c *gin.Context) {
	id := c.Param("id")

	var prediction models.Prediction
	if err := database.DB.First(&prediction, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Prediksi tidak ditemukan"})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Gagal mengambil data prediksi"})
		return
	}

	if err := database.DB.Delete(&prediction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Gagal menghapus prediksi"})
		return
	}

	c.JSON(http.StatusOK, dto.MessageDeletePredictionResponse{Message: "Prediksi berhasil dihapus"})
}
