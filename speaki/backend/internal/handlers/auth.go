package handlers

import (
	"net/http"
	"strconv"

	"speaki-backend/internal/models"
	"speaki-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	service      *services.AuthService
	chatService  *services.ChatService
	matchService *services.MatchService
}

func NewAuthHandler(service *services.AuthService, chatService *services.ChatService, matchService *services.MatchService) *AuthHandler {
	return &AuthHandler{service: service, chatService: chatService, matchService: matchService}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var request models.AuthRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request payload"})
		return
	}

	user, err := h.service.Register(request.Email, request.Password, request.Interests, request.Intent, request.Location, request.Activities)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Generate token for new user
	token, err := h.service.GenerateToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	userResponse := models.UserResponse{
		ID:           strconv.FormatUint(uint64(user.ID), 10),
		Username:     user.Email,
		Email:        user.Email,
		Interests:    user.Interests,
		Intent:       user.Intent,
		AvatarURL:    "",
		Bio:          "",
		OnlineStatus: user.IsOnline,
	}

	c.JSON(http.StatusCreated, models.LoginResponse{
		Token: token,
		User:  userResponse,
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var request models.AuthRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request payload"})
		return
	}

	token, user, err := h.service.Login(request.Email, request.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	userResponse := models.UserResponse{
		ID:           strconv.FormatUint(uint64(user.ID), 10),
		Username:     user.Email,
		Email:        user.Email,
		Interests:    user.Interests,
		Intent:       user.Intent,
		AvatarURL:    "",
		Bio:          "",
		OnlineStatus: user.IsOnline,
	}

	c.JSON(http.StatusOK, models.LoginResponse{
		Token: token,
		User:  userResponse,
	})
}

func (h *AuthHandler) Protected(c *gin.Context) {
	userID, _ := c.Get("userID")
	c.JSON(http.StatusOK, gin.H{
		"message": "protected route",
		"userID":  userID,
	})
}

func (h *AuthHandler) History(c *gin.Context) {
	currentUser, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	currentUserID, ok := currentUser.(string)
	if !ok || currentUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user id"})
		return
	}

	otherUserID := c.Param("userId")
	if otherUserID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "userId is required"})
		return
	}

	messages, err := h.chatService.GetConversation(currentUserID, otherUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"messages": messages})
}

func (h *AuthHandler) GetMatches(c *gin.Context) {
	currentUser, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	currentUserID, ok := currentUser.(string)
	if !ok || currentUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user id"})
		return
	}

	userID, err := strconv.ParseUint(currentUserID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id format"})
		return
	}

	matches, err := h.matchService.GetMatches(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"matches": matches})
}
