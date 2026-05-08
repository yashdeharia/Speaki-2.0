package handlers

import (
	"errors"
	"net/http"

	"speaki-backend/internal/services"

	"github.com/gin-gonic/gin"
)

type ChatAPIHandler struct {
	service *services.ChatService
}

func (h *ChatAPIHandler) UserStatus(c *gin.Context) {
	userID := c.Param("id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user id is required"})
		return
	}

	isOnline, lastSeen, err := h.service.GetUserStatus(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"isOnline": isOnline, "lastSeen": lastSeen})
}

type BlockRequest struct {
	BlockedID string `json:"blocked_id" binding:"required"`
}

type ReportRequest struct {
	ReportedID string `json:"reported_id" binding:"required"`
	Reason     string `json:"reason" binding:"required"`
}

func NewChatAPIHandler(service *services.ChatService) *ChatAPIHandler {
	return &ChatAPIHandler{service: service}
}

func (h *ChatAPIHandler) History(c *gin.Context) {
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

	messages, err := h.service.GetConversation(currentUserID, otherUserID)
	if err != nil {
		if errors.Is(err, services.ErrBlockedConversation) {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"messages": messages})
}

func (h *ChatAPIHandler) Block(c *gin.Context) {
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

	var req BlockRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request payload"})
		return
	}

	if err := h.service.SaveUserBlock(currentUserID, req.BlockedID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User blocked successfully"})
}

func (h *ChatAPIHandler) Report(c *gin.Context) {
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

	var req ReportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request payload"})
		return
	}

	if err := h.service.SaveUserReport(currentUserID, req.ReportedID, req.Reason); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User reported successfully"})
}
