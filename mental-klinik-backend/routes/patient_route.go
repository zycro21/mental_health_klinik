package routes

import (
	"mental-klinik-backend/controllers"
	"mental-klinik-backend/middlewares"

	"github.com/gin-gonic/gin"
)

func PatientRoutes(r *gin.Engine) {
	patient := r.Group("/api/patients")

	// Protected Routes - Requires JWT
	protected := patient.Group("/")
	protected.Use(middlewares.AuthMiddleware())

	// Only admin can get full list of patients
	protected.POST("/", controllers.CreatePatient)
	protected.GET("/", middlewares.AuthorizeRole("admin, staff"), controllers.GetAllPatients)

	// Get by ID, Update, Delete (dapat dibuka untuk admin & staff)
	protected.GET("/:id", middlewares.AuthorizeRole("admin", "staff"), controllers.GetPatientByID)
	protected.PUT("/:id", middlewares.AuthorizeRole("admin", "staff"), controllers.UpdatePatient)
	protected.DELETE("/:id", middlewares.AuthorizeRole("admin"), controllers.DeletePatient)
}