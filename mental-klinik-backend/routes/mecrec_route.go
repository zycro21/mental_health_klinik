package routes

import (
	"mental-klinik-backend/controllers"
	"mental-klinik-backend/middlewares"

	"github.com/gin-gonic/gin"
)

func MedicalRecordRoutes(r *gin.Engine) {
	medical := r.Group("/api/medical-records")

	// Semua endpoint wajib login
	protected := medical.Group("/")
	protected.Use(middlewares.AuthMiddleware())

	// Create Medical Record (Admin, Dokter, Staff)
	protected.POST("/", middlewares.AuthorizeRole("admin", "doctor", "staff"), controllers.CreateMedicalRecord)

	// Get All Medical Records (Admin, Dokter, Staff)
	protected.GET("/", middlewares.AuthorizeRole("admin", "doctor", "staff"), controllers.GetAllMedicalRecords)

	// Get Medical Record by ID (Admin, Dokter, Staff)
	protected.GET("/:id", middlewares.AuthorizeRole("admin", "doctor", "staff"), controllers.GetMedicalRecordByID)

	// Update Medical Record (Admin, Dokter)
	protected.PUT("/:id", middlewares.AuthorizeRole("admin", "doctor"), controllers.UpdateMedicalRecord)

	// Delete Medical Record (Admin only)
	protected.DELETE("/:id", middlewares.AuthorizeRole("admin"), controllers.DeleteMedicalRecord)
}
