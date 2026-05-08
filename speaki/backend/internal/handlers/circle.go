package handlers

import (
	"net/http"
	"speaki-backend/internal/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CircleHandler struct {
	circleService *services.CircleService
}

func NewCircleHandler(circleService *services.CircleService) *CircleHandler {
	return &CircleHandler{circleService: circleService}
}

func (h *CircleHandler) CreateCircles(c *gin.Context) {
	if err := h.circleService.CreateCircles(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Circles created successfully"})
}

func (h *CircleHandler) GetUserCircles(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	circles, err := h.circleService.GetUserCircles(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, circles)
}

func (h *CircleHandler) GetCurrentUserCircles(c *gin.Context) {
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

	userID, err := strconv.ParseUint(currentUserID, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id format"})
		return
	}

	circles, err := h.circleService.GetUserCircles(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, circles)
}

func (h *CircleHandler) GetCircleMembers(c *gin.Context) {
	circleIDStr := c.Param("circleId")
	circleID, err := strconv.ParseUint(circleIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid circle ID"})
		return
	}

	users, err := h.circleService.GetCircleMembers(uint(circleID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, users)
}

func (h *CircleHandler) CleanupExpiredCircles(c *gin.Context) {
	if err := h.circleService.CleanupExpiredCircles(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Expired circles cleaned up"})
}

func (h *CircleHandler) DeleteCircle(c *gin.Context) {
	circleIDStr := c.Param("circleId")
	circleID, err := strconv.ParseUint(circleIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid circle ID"})
		return
	}

	if err := h.circleService.DeleteCircle(uint(circleID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Circle deleted successfully"})
}
