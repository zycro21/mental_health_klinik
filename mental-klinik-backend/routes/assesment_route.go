package routes

import (
	"mental-klinik-backend/controllers"
	"mental-klinik-backend/middlewares"

	"github.com/gin-gonic/gin"
)

func AssessmentRoutes(r *gin.Engine) {
	assessment := r.Group("/api/assessments")

	// Semua endpoint di bawah wajib JWT
	protected := assessment.Group("/")
	protected.Use(middlewares.AuthMiddleware())

	// Create Assessment (admin, doctor, staff bisa membuat)
	protected.POST("/", middlewares.AuthorizeRole("admin", "doctor", "staff"), controllers.CreateAssessment)

	// Get All Assessments (admin dan staff bisa lihat semua)
	protected.GET("/", middlewares.AuthorizeRole("admin", "staff"), controllers.GetAllAssessments)

	// Get Assessment by ID (admin, doctor, staff)
	protected.GET("/:id", middlewares.AuthorizeRole("admin", "doctor", "staff"), controllers.GetAssessmentByID)

	// Update Assessment (admin dan doctor bisa ubah, misal untuk koreksi jawaban atau tanggal)
	protected.PUT("/:id", middlewares.AuthorizeRole("admin", "doctor"), controllers.UpdateAssessment)

	// Delete Assessment (hanya admin yang boleh)
	protected.DELETE("/:id", middlewares.AuthorizeRole("admin"), controllers.DeleteAssessment)

	// Get Assessments by Patient ID (riwayat assessment pasien tertentu)
	protected.GET("/byPatient/:patientId", middlewares.AuthorizeRole("admin", "doctor", "staff"), controllers.GetAssessmentsByPatientID)
}
