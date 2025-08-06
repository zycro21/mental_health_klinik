package routes

import (
	"mental-klinik-backend/controllers"
	"mental-klinik-backend/middlewares"

	"github.com/gin-gonic/gin"
)

func UserRoutes(r *gin.Engine) {
	user := r.Group("/api/users")

	// Public Routes
	user.POST("/register", controllers.Register)
	user.POST("/login", controllers.Login)

	// Protected Routes (Require JWT)
	protected := user.Group("/")
	protected.Use(middlewares.AuthMiddleware())

	protected.GET("/", middlewares.AuthorizeRole("admin"), controllers.GetAllUsers)
	protected.GET("/:id", middlewares.AuthorizeRole("admin"), controllers.GetUserByID)
	protected.PUT("/:id", controllers.UpdateUser)	
	protected.DELETE("/:id", middlewares.AuthorizeRole("admin"), controllers.DeleteUser)
}