package services

import (
	"speaki-backend/internal/models"

	"gorm.io/gorm"
)

type MatchService struct {
	db *gorm.DB
}

func NewMatchService(db *gorm.DB) *MatchService {
	return &MatchService{db: db}
}

func (s *MatchService) GetMatches(currentUserID uint) ([]models.MatchResult, error) {
	var currentUser models.User
	if err := s.db.First(&currentUser, currentUserID).Error; err != nil {
		return nil, err
	}

	var allUsers []models.User
	if err := s.db.Where("id != ?", currentUserID).Find(&allUsers).Error; err != nil {
		return nil, err
	}

	var matches []models.MatchResult
	for _, user := range allUsers {
		score := s.calculateScore(currentUser, user)
		matches = append(matches, models.MatchResult{
			User:  user,
			Score: score,
		})
	}

	// Sort by score descending (simple bubble sort for small dataset)
	for i := 0; i < len(matches)-1; i++ {
		for j := 0; j < len(matches)-i-1; j++ {
			if matches[j].Score < matches[j+1].Score {
				matches[j], matches[j+1] = matches[j+1], matches[j]
			}
		}
	}

	// Return top 10
	if len(matches) > 10 {
		matches = matches[:10]
	}

	return matches, nil
}

func (s *MatchService) calculateScore(currentUser, otherUser models.User) int {
	score := 0

	// Common interests (5 points each)
	commonInterests := countCommonStrings(currentUser.Interests, otherUser.Interests)
	score += commonInterests * 5

	// Same intent (10 points)
	if currentUser.Intent == otherUser.Intent && currentUser.Intent != "" {
		score += 10
	}

	// Location match (3 points)
	if currentUser.Location == otherUser.Location && currentUser.Location != "" {
		score += 3
	}

	// Activity score (2 points each)
	commonActivities := countCommonStrings(currentUser.Activities, otherUser.Activities)
	score += commonActivities * 2

	return score
}

func countCommonStrings(slice1, slice2 []string) int {
	count := 0
	for _, s1 := range slice1 {
		for _, s2 := range slice2 {
			if s1 == s2 {
				count++
				break
			}
		}
	}
	return count
}
