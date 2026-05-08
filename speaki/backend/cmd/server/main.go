package main

import (
	"log"
	"time"

	"speaki-backend/internal/handlers"
	"speaki-backend/internal/services"
	"speaki-backend/internal/ws"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	db, err := services.NewDatabase("app.db")
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	authService := services.NewAuthService(db, "super-secret-key")
	chatService := services.NewChatService(db)
	matchService := services.NewMatchService(db)
	circleService := services.NewCircleService(db)
	healthService := services.NewHealthService()
	chatAPIHandler := handlers.NewChatAPIHandler(chatService)
	chatHandler := ws.NewChatHandler(authService, chatService)
	authHandler := handlers.NewAuthHandler(authService, chatService, matchService)
	circleHandler := handlers.NewCircleHandler(circleService)

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"https://shiny-broccoli-vwqq9r96pv7295w-3000.app.github.dev", "http://localhost:3000", "*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	handlers.RegisterRoutes(router,
		handlers.NewHealthHandler(healthService),
		chatHandler.Handle,
		authHandler,
		chatAPIHandler,
		circleHandler,
		handlers.AuthMiddleware(authService),
	)

	go func() {
		ticker := time.NewTicker(6 * time.Hour)
		defer ticker.Stop()
		for range ticker.C {
			if err := circleService.CleanupExpiredCircles(); err != nil {
				log.Printf("circle cleanup failed: %v", err)
			}
			if err := circleService.CreateCircles(); err != nil {
				log.Printf("circle creation failed: %v", err)
			}
		}
	}()

	if err := router.Run(":8080"); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
