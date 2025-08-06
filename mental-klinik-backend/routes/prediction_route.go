package routes

import (
	"mental-klinik-backend/controllers"
	"mental-klinik-backend/middlewares"

	"github.com/gin-gonic/gin"
)

func PredictionRoutes(r *gin.Engine) {
	predictions := r.Group("/api/predictions")

	// Semua endpoint di bawah wajib login
	protected := predictions.Group("/")
	protected.Use(middlewares.AuthMiddleware())

	// GET semua prediksi (admin, doctor, staff)
	protected.GET("/", middlewares.AuthorizeRole("admin", "doctor", "staff"), controllers.GetAllPredictions)

	// GET prediksi berdasarkan ID (admin, doctor, staff)
	protected.GET("/:id", middlewares.AuthorizeRole("admin", "doctor", "staff"), controllers.GetPredictionByID)

	// GET prediksi berdasarkan assessment ID (admin, doctor, staff)
	protected.GET("/assessment/:assessment_id", middlewares.AuthorizeRole("admin", "doctor", "staff"), controllers.GetPredictionByAssessmentID)

	// POST prediksi baru berdasarkan assessment ID (admin, doctor)
	protected.POST("/:id", middlewares.AuthorizeRole("admin", "doctor"), controllers.PredictMentalHealth)

	// PUT update prediksi (admin saja atau sesuai kebutuhan)
	protected.PUT("/:id", middlewares.AuthorizeRole("admin"), controllers.UpdatePredictionByID)

	// DELETE prediksi (admin)
	protected.DELETE("/:id", middlewares.AuthorizeRole("admin"), controllers.DeletePredictionByID)
}
