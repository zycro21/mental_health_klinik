package controllers

import (
	"fmt"
	"strconv"

	"mental-klinik-backend/databases"
	"mental-klinik-backend/middlewares"
	"mental-klinik-backend/models"
	"mental-klinik-backend/utils"
	"mental-klinik-backend/dto"

	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Register godoc
// @Summary Register new user
// @Description Create a new user with full name, email, password, and role
// @Tags Users
// @Accept json
// @Produce json
// @Param request body dto.RegisterUserRequest true "Register input"
// @Success 201 {object} dto.RegisterUserResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/users/register [post]
func Register(c *gin.Context) {
	var input dto.RegisterUserRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	// Cek apakah email sudah digunakan
	var existing models.User
	if err := database.DB.Where("email = ?", input.Email).First(&existing).Error; err != gorm.ErrRecordNotFound {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "Email Already Used and Registered"})
		return
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(input.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to hash password"})
		return
	}

	// Hitung jumlah user dengan role yang sama
	var count int64
	database.DB.Model(&models.User{}).Where("role = ?", input.Role).Count(&count)

	// Generate custom ID
	newID := utils.GenerateCustomUserID(input.Role, int(count+1))

	// Simpan user
	user := models.User{
		ID:       newID,
		FullName: input.FullName,
		Email:    input.Email,
		Password: hashedPassword,
		Role:     input.Role,
	}
	database.DB.Create(&user)

	// Response tanpa password
	response := dto.RegisterUserResponse{
		Message: "User Registered",
		User: dto.UserResponse{
			ID:       user.ID,
			FullName: user.FullName,
			Email:    user.Email,
			Role:     user.Role,
		},
	}
	c.JSON(http.StatusCreated, response)
}

// Login godoc
// @Summary Login user
// @Description Authenticate user and return JWT token
// @Tags Users
// @Accept json
// @Produce json
// @Param credentials body dto.LoginUserRequest true "Login credentials"
// @Success 200 {object} dto.LoginResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /api/users/login [post]
func Login(c *gin.Context) {
	var input dto.LoginUserRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})	
		return
	}

	var user models.User
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Credentials"})
		return
	}

	if !utils.CheckPasswordHash(input.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Password"})
		return
	}

	token, _ := middlewares.GenerateToken(user.ID, user.Role)

	c.JSON(http.StatusOK, dto.LoginResponse{
		Token: token,
		Email: user.Email,
		Role:  user.Role,
	})
}

// GetAllUsers godoc
// @Summary Get all users
// @Description Get paginated list of users with optional search, role filter, and sorting. Only accessible by admin.
// @Tags Users
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param search query string false "Search by name or email"
// @Param role query string false "Filter by role (admin, doctor, staff)"
// @Param sort query string false "Sort by field (e.g. full_name, email, created_at)" default(created_at)
// @Param order query string false "Sort order (asc or desc)" default(desc)
// @Success 200 {object} dto.PaginatedUsersResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 403 {object} dto.ErrorResponse
// @Router /api/users/ [get]
func GetAllUsers(c *gin.Context) {
	db := database.DB
	var users []models.User

	// Query Params
	page := c.DefaultQuery("page", "1")
	limit := c.DefaultQuery("limit", "10")
	search := c.Query("search")
	role := c.Query("role")
	sort := c.DefaultQuery("sort", "created_at")
	order := c.DefaultQuery("order", "desc")

	// Convert String ke Int
	pageInt, _ := strconv.Atoi(page)
	limitInt, _ := strconv.Atoi(limit)
	offset := (pageInt - 1) * limitInt

	query := db.Model(&models.User{})

	// Filtering
	if search != "" {
		query = query.Where("full_name ILIKE ? OR email ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	if role != "" {
		query = query.Where("role = ?", role)
	}

	// Sorting
	if sort != "" && (order == "asc" || order == "desc") {
		query = query.Order(fmt.Sprintf("%s %s", sort, order))
	}

	// Total Count
	var total int64
	query.Count(&total)

	// Pagination
	query = query.Offset(offset).Limit(limitInt).Find(&users)

	// Convert ke dto.UserResponse
	var userResponses []dto.UserResponse
	for _, u := range users {
		userResponses = append(userResponses, dto.UserResponse{
			ID:       u.ID,
			FullName: u.FullName,
			Email:    u.Email,
			Role:     u.Role,
		})
	}

	c.JSON(http.StatusOK, dto.PaginatedUsersResponse{
		Data:       userResponses,
		Total:      int(total),
		Page:       pageInt,
		Limit:      limitInt,
		TotalPages: int((total + int64(limitInt) - 1) / int64(limitInt)),
	})
}

// GetUserByID godoc
// @Summary Get user by ID
// @Description Retrieve a single user by their ID. Only accessible by admin.
// @Tags Users
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} dto.UserResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 403 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Router /api/users/{id} [get]
func GetUserByID(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User Not Found"})
		return
	}

	c.JSON(http.StatusOK, dto.UserResponse{
		ID:       user.ID,
		FullName: user.FullName,
		Email:    user.Email,
		Role:     user.Role,
	})
}

// UpdateUser godoc
// @Summary Update user by ID
// @Description Update user information by ID. Can update fullName, email, password, and role. Requires authentication.
// @Tags Users
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Param input body dto.UpdateUserInput true "Updated user data"
// @Success 200 {object} dto.UserResponse
// @Failure 400 {object} dto.ErrorResponse "Bad Request"
// @Failure 401 {object} dto.ErrorResponse "Unauthorized"
// @Failure 403 {object} dto.ErrorResponse "Forbidden"
// @Failure 404 {object} dto.ErrorResponse "User Not Found"
// @Failure 500 {object} dto.ErrorResponse "Failed to Update User"
// @Router /api/users/{id} [put]
func UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User Not Found"})
		return
	}

	var input dto.UpdateUserInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Optional: Hash New Password if Provided
	if input.Password != "" {
		hashed, err := utils.HashPassword(input.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to Hash Password"})
			return
		}
		user.Password = hashed
	}

	if input.FullName != "" {
		user.FullName = input.FullName
	}
	if input.Email != "" {
		user.Email = input.Email
	}
	if input.Role != "" {
		user.Role = input.Role
	}

	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to Update User"})
		return
	}

	c.JSON(http.StatusOK, dto.UserResponse{
		ID:       user.ID,
		FullName: user.FullName,
		Email:    user.Email,
		Role:     user.Role,
	})
}

// DeleteUser godoc
// @Summary Delete user by ID
// @Description Delete a user by their ID. Only accessible by admin.
// @Tags Users
// @Security BearerAuth
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} dto.MessageDeleteResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 403 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /api/users/{id} [delete]
func DeleteUser(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.User{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to Delete User"})
		return
	}

	c.JSON(http.StatusOK, dto.MessageDeleteResponse{Message: "User Deleted Successfully"})
}
