package services

import (
	"fmt"
	"math/rand"
	"speaki-backend/internal/models"
	"time"

	"gorm.io/gorm"
)

type CircleService struct {
	db *gorm.DB
}

func NewCircleService(db *gorm.DB) *CircleService {
	rand.Seed(time.Now().UnixNano())
	return &CircleService{db: db}
}

func (s *CircleService) CreateCircles() error {
	var users []models.User
	if err := s.db.Find(&users).Error; err != nil {
		return err
	}

	validUsers := make([]models.User, 0, len(users))
	for _, user := range users {
		if len(user.Interests) > 0 {
			validUsers = append(validUsers, user)
		}
	}

	if len(validUsers) < 1 {
		return fmt.Errorf("not enough users with interests to create circles (need at least 1, have %d)", len(validUsers))
	}

	interestGroups := s.groupUsersByInterests(validUsers)

	for interest, userGroup := range interestGroups {
		if len(userGroup) >= 5 {
			if err := s.createCirclesForInterest(interest, userGroup); err != nil {
				return err
			}
		}
	}

	return nil
}

func (s *CircleService) groupUsersByInterests(users []models.User) map[string][]models.User {
	groups := make(map[string][]models.User)

	for _, user := range users {
		for _, interest := range user.Interests {
			groups[interest] = append(groups[interest], user)
		}
	}

	// Remove groups with less than 5 users
	for interest, users := range groups {
		if len(users) < 5 {
			delete(groups, interest)
		}
	}

	return groups
}

func (s *CircleService) createCirclesForInterest(interest string, users []models.User) error {
	rand.Shuffle(len(users), func(i, j int) {
		users[i], users[j] = users[j], users[i]
	})

	const minSize = 5
	const maxSize = 8
	for start := 0; start < len(users); {
		remaining := len(users) - start
		if remaining < minSize {
			break
		}

		groupSize := minSize + rand.Intn(maxSize-minSize+1)
		if groupSize > remaining {
			groupSize = remaining
		}

		if remaining-groupSize > 0 && remaining-groupSize < minSize {
			groupSize = remaining
		}

		circleUsers := users[start : start+groupSize]
		if err := s.createCircle(interest, circleUsers); err != nil {
			return err
		}
		start += groupSize
	}

	return nil
}

func (s *CircleService) createCircle(theme string, users []models.User) error {
	// Generate random expiration time (24-72 hours from now)
	hours := 24 + rand.Intn(49) // 24-72 hours
	expiresAt := time.Now().Add(time.Duration(hours) * time.Hour)

	// Create circle
	circle := models.Circle{
		Name:      fmt.Sprintf("%s Circle #%d", theme, rand.Intn(10000)),
		Theme:     theme,
		ExpiresAt: expiresAt,
	}

	if err := s.db.Create(&circle).Error; err != nil {
		return err
	}

	// Add members
	for _, user := range users {
		member := models.CircleMember{
			CircleID: circle.ID,
			UserID:   user.ID,
			JoinedAt: time.Now(),
		}

		if err := s.db.Create(&member).Error; err != nil {
			return err
		}
	}

	return nil
}

func (s *CircleService) GetUserCircles(userID uint) ([]models.Circle, error) {
	var circles []models.Circle
	err := s.db.Joins("JOIN circle_members ON circles.id = circle_members.circle_id").
		Where("circle_members.user_id = ? AND circles.expires_at > ?", userID, time.Now()).
		Find(&circles).Error

	return circles, err
}

func (s *CircleService) GetCircleMembers(circleID uint) ([]models.User, error) {
	var users []models.User
	err := s.db.Joins("JOIN circle_members ON users.id = circle_members.user_id").
		Where("circle_members.circle_id = ?", circleID).
		Find(&users).Error

	return users, err
}

func (s *CircleService) CleanupExpiredCircles() error {
	return s.db.Where("expires_at < ?", time.Now()).Delete(&models.Circle{}).Error
}

func (s *CircleService) DeleteCircle(circleID uint) error {
	return s.db.Delete(&models.Circle{}, circleID).Error
}
