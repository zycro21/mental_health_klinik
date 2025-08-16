// @title Klinik API
// @version 1.0
// @description API untuk sistem informasi klinik kesehatan mental
// @host localhost:8080
// @BasePath /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
package main

import (
	"log"
	"os"
	"time"


	"mental-klinik-backend/databases" 
	"mental-klinik-backend/routes"

	_ "mental-klinik-backend/docs" // Swagger UI

	"github.com/gin-contrib/cors"  
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func main() {
	// Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error Loading .env File")
	}

	// Koneksi DB
	database.ConnectDB()
	log.Println("DATABASE CONNECTED!!")

	// Inisialisasi Gin Router
	r := gin.Default()

	// Middleware CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://172.26.0.1:3000"}, // alamat frontend
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Route Swagger
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Route Testing
	r.GET("/testing", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "testing berhasil"})
	})

	routes.UserRoutes(r)
	routes.PatientRoutes(r)
	routes.AssessmentRoutes(r)
	routes.AppointmentRoutes(r)
	routes.PredictionRoutes(r)
	routes.MedicalRecordRoutes(r)

	// Listen & Serve
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Default Port
	}
	log.Println("Server Running on port", port)
	r.Run(":" + port)
}