package routes

import (
	"mental-klinik-backend/controllers"
	"mental-klinik-backend/middlewares"

	"github.com/gin-gonic/gin"
)

func AppointmentRoutes(r *gin.Engine) {
	appointment := r.Group("/api/appointments")

	// Semua endpoint di bawah wajib JWT
	protected := appointment.Group("/")
	protected.Use(middlewares.AuthMiddleware())

	// Create Appointment (Admin & Staff & Dokter bisa buat)
	protected.POST("/", middlewares.AuthorizeRole("admin", "staff", "doctor"), controllers.CreateAppointment)

	// Get All Appointments (Admin & Staff)
	protected.GET("/", middlewares.AuthorizeRole("admin", "staff"), controllers.GetAllAppointments)

	// Get Appointment by ID
	protected.GET("/:id", middlewares.AuthorizeRole("admin", "staff", "doctor"), controllers.GetAppointmentByID)

	// Update Appointment (Admin & Dokter saja yang boleh ubah jadwal/notes)
	protected.PUT("/:id", middlewares.AuthorizeRole("admin", "doctor"), controllers.UpdateAppointment)

	// Delete Appointment (Admin only)
	protected.DELETE("/:id", middlewares.AuthorizeRole("admin"), controllers.DeleteAppointment)

	// Get Appointments by Patient ID (untuk melihat riwayat appointment pasien tertentu)
	protected.GET("/appoinmentPatient/:patientId", middlewares.AuthorizeRole("admin", "staff", "doctor"), controllers.GetAppointmentsByPatientID)

	// Get Appointments by User ID (dokter bisa lihat miliknya sendiri)
	protected.GET("/appoinmentUser/:userId", middlewares.AuthorizeRole("admin", "doctor"), controllers.GetAppointmentsByUserID)

	// Change status (misal: pending → done, cancel, dsb) — hanya dokter dan admin
	protected.PATCH("/:id/statusAppoinment", middlewares.AuthorizeRole("admin", "doctor"), controllers.ChangeAppointmentStatus)
}
