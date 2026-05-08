package services

import (
	"speaki-backend/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func NewDatabase(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	if err := db.AutoMigrate(&models.User{}, &models.Message{}, &models.Circle{}, &models.CircleMember{}, &models.UserReport{}, &models.UserBlock{}); err != nil {
		return nil, err
	}

	return db, nil
}
