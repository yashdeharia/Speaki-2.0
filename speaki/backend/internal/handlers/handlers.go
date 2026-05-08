package handlers

import (
	"speaki-backend/internal/models"
	"speaki-backend/internal/services"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine, healthHandler gin.HandlerFunc, wsHandler gin.HandlerFunc, authHandler *AuthHandler, chatAPIHandler *ChatAPIHandler, circleHandler *CircleHandler, authMiddleware gin.HandlerFunc) {
	// API routes
	api := router.Group("/api")
	{
		api.GET("/health", healthHandler)
		api.POST("/auth/register", authHandler.Register)
		api.POST("/auth/login", authHandler.Login)

		// Protected auth routes
		authGroup := api.Group("")
		authGroup.Use(authMiddleware)
		authGroup.GET("/protected", authHandler.Protected)
		authGroup.GET("/messages/:userId", authHandler.History)
		authGroup.GET("/matches", authHandler.GetMatches)

		// Chat routes
		chatGroup := api.Group("")
		chatGroup.Use(authMiddleware)
		chatGroup.POST("/block", chatAPIHandler.Block)
		chatGroup.POST("/report", chatAPIHandler.Report)
		chatGroup.GET("/users/status/:id", chatAPIHandler.UserStatus)

		// Circle routes
		circleGroup := api.Group("")
		circleGroup.Use(authMiddleware)
		circleGroup.POST("/circles/create", circleHandler.CreateCircles)
		circleGroup.GET("/circles", circleHandler.GetCurrentUserCircles)
		circleGroup.GET("/circles/user/:userId", circleHandler.GetUserCircles)
		circleGroup.GET("/circles/:circleId/members", circleHandler.GetCircleMembers)
		circleGroup.POST("/circles/cleanup", circleHandler.CleanupExpiredCircles)
		circleGroup.DELETE("/circles/:circleId", circleHandler.DeleteCircle)
	}

	// WebSocket route (no /api prefix)
	router.GET("/ws/chat", wsHandler)
}

func NewHealthHandler(service *services.HealthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(200, models.HealthResponse{Status: service.Status()})
	}
}
