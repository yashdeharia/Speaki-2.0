package services

import (
	"errors"
	"math"
	"strconv"
	"time"

	"speaki-backend/internal/models"

	"gorm.io/gorm"
)

var ErrBlockedConversation = errors.New("conversation unavailable due to block")

type ChatService struct {
	db *gorm.DB
}

func NewChatService(db *gorm.DB) *ChatService {
	return &ChatService{db: db}
}

func (s *ChatService) SaveMessage(senderID, receiverID, content string) (*models.Message, error) {
	if senderID == "" || receiverID == "" || content == "" {
		return nil, errors.New("sender, receiver, and content are required")
	}

	sender, err := parseUint(senderID)
	if err != nil {
		return nil, err
	}

	receiver, err := parseUint(receiverID)
	if err != nil {
		return nil, err
	}

	blocked, err := s.IsBlocked(sender, receiver)
	if err != nil {
		return nil, err
	}
	if blocked {
		return nil, errors.New("cannot send message to blocked user")
	}

	message := models.Message{
		SenderID:   sender,
		ReceiverID: receiver,
		Content:    content,
		Status:     "sent",
	}

	if err := s.db.Create(&message).Error; err != nil {
		return nil, err
	}

	if err := s.trimConversation(sender, receiver); err != nil {
		return nil, err
	}

	if err := s.UpdateUserActivityScore(sender); err != nil {
		return nil, err
	}

	return &message, nil
}

func (s *ChatService) SetUserOnline(userID string) error {
	uid, err := parseUint(userID)
	if err != nil {
		return err
	}

	return s.db.Model(&models.User{}).
		Where("id = ?", uid).
		Updates(map[string]interface{}{"is_online": true}).Error
}

func (s *ChatService) SetUserOffline(userID string) error {
	uid, err := parseUint(userID)
	if err != nil {
		return err
	}

	return s.db.Model(&models.User{}).
		Where("id = ?", uid).
		Updates(map[string]interface{}{"is_online": false, "last_seen": time.Now()}).Error
}

func (s *ChatService) GetUserStatus(userID string) (bool, time.Time, error) {
	uid, err := parseUint(userID)
	if err != nil {
		return false, time.Time{}, err
	}

	var user models.User
	if err := s.db.Select("is_online", "last_seen").First(&user, uid).Error; err != nil {
		return false, time.Time{}, err
	}

	return user.IsOnline, user.LastSeen, nil
}

func (s *ChatService) trimConversation(sender, receiver uint) error {
	var older []models.Message
	query := s.db.Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)", sender, receiver, receiver, sender).
		Order("id desc").
		Offset(50)

	if err := query.Find(&older).Error; err != nil {
		return err
	}

	if len(older) == 0 {
		return nil
	}

	var ids []uint
	for _, msg := range older {
		ids = append(ids, msg.ID)
	}

	return s.db.Delete(&models.Message{}, ids).Error
}

func (s *ChatService) GetConversation(userID, otherUserID string) ([]models.Message, error) {
	if userID == "" || otherUserID == "" {
		return nil, errors.New("user IDs are required")
	}

	user, err := parseUint(userID)
	if err != nil {
		return nil, err
	}

	other, err := parseUint(otherUserID)
	if err != nil {
		return nil, err
	}

	blocked, err := s.IsBlocked(user, other)
	if err != nil {
		return nil, err
	}
	if blocked {
		return nil, ErrBlockedConversation
	}

	var messages []models.Message
	if err := s.db.Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)", user, other, other, user).
		Order("created_at desc").
		Limit(50).
		Find(&messages).Error; err != nil {
		return nil, err
	}

	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}

	return messages, nil
}

func (s *ChatService) SaveUserReport(reporterID, reportedID, reason string) error {
	if reporterID == "" || reportedID == "" || reason == "" {
		return errors.New("reporter, reported user, and reason are required")
	}

	reporter, err := parseUint(reporterID)
	if err != nil {
		return err
	}

	reported, err := parseUint(reportedID)
	if err != nil {
		return err
	}

	report := models.UserReport{
		ReporterID: reporter,
		ReportedID: reported,
		Reason:     reason,
	}

	if err := s.db.Create(&report).Error; err != nil {
		return err
	}

	return s.UpdateUserActivityScore(reported)
}

func (s *ChatService) MarkMessageDelivered(messageID uint) (*models.Message, error) {
	var msg models.Message
	if err := s.db.First(&msg, messageID).Error; err != nil {
		return nil, err
	}

	if msg.Status == "delivered" || msg.Status == "seen" {
		return &msg, nil
	}

	msg.Status = "delivered"
	if err := s.db.Model(&models.Message{}).Where("id = ?", messageID).Update("status", "delivered").Error; err != nil {
		return nil, err
	}

	return &msg, nil
}

func (s *ChatService) MarkMessageSeen(messageID uint, receiverID uint) (*models.Message, error) {
	var msg models.Message
	if err := s.db.First(&msg, messageID).Error; err != nil {
		return nil, err
	}

	if msg.ReceiverID != receiverID {
		return nil, errors.New("only receiver can mark message as seen")
	}

	if msg.Status == "seen" {
		return &msg, nil
	}

	msg.Status = "seen"
	if err := s.db.Model(&models.Message{}).Where("id = ?", messageID).Update("status", "seen").Error; err != nil {
		return nil, err
	}

	return &msg, nil
}

func (s *ChatService) SaveUserBlock(blockerID, blockedID string) error {
	if blockerID == "" || blockedID == "" {
		return errors.New("blocker and blocked user IDs are required")
	}

	blocker, err := parseUint(blockerID)
	if err != nil {
		return err
	}

	blocked, err := parseUint(blockedID)
	if err != nil {
		return err
	}

	if blocker == blocked {
		return errors.New("cannot block yourself")
	}

	userBlock := models.UserBlock{
		BlockerID: blocker,
		BlockedID: blocked,
	}

	return s.db.FirstOrCreate(&userBlock, models.UserBlock{BlockerID: blocker, BlockedID: blocked}).Error
}

func (s *ChatService) IsBlocked(userA, userB uint) (bool, error) {
	var count int64
	if err := s.db.Model(&models.UserBlock{}).
		Where("(blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)", userA, userB, userB, userA).
		Count(&count).Error; err != nil {
		return false, err
	}

	return count > 0, nil
}

func (s *ChatService) UpdateUserActivityScore(userID uint) error {
	var messages []models.Message
	if err := s.db.Where("sender_id = ? OR receiver_id = ?", userID, userID).
		Order("created_at asc").
		Find(&messages).Error; err != nil {
		return err
	}

	var reportCount int64
	if err := s.db.Model(&models.UserReport{}).
		Where("reported_id = ? AND LOWER(reason) = ?", userID, "explicit_content").
		Count(&reportCount).Error; err != nil {
		return err
	}

	score := calculateActivityScore(userID, messages, int(reportCount))

	return s.db.Model(&models.User{}).
		Where("id = ?", userID).
		Update("activity_score", score).Error
}

func (s *ChatService) calculateConversationMetrics(userID uint, messages []models.Message) (float64, float64, int) {
	totalMessages := len(messages)
	if totalMessages == 0 {
		return 0, 0, 0
	}

	partnerStats := make(map[uint]struct {
		sent     int
		received int
		lastInAt time.Time
		delays   []float64
	})

	for _, msg := range messages {
		partnerID := msg.SenderID
		if msg.SenderID == userID {
			partnerID = msg.ReceiverID
		}

		stats := partnerStats[partnerID]
		if msg.SenderID == userID {
			stats.sent++
			if !stats.lastInAt.IsZero() {
				delay := msg.CreatedAt.Sub(stats.lastInAt).Seconds()
				if delay >= 0 {
					stats.delays = append(stats.delays, delay)
				}
				stats.lastInAt = time.Time{}
			}
		} else {
			stats.received++
			stats.lastInAt = msg.CreatedAt
		}
		partnerStats[partnerID] = stats
	}

	var totalDelay float64
	var delayCount int
	var totalRatio float64
	var ratioCount int

	for _, stats := range partnerStats {
		delayCount += len(stats.delays)
		for _, d := range stats.delays {
			totalDelay += d
		}

		if stats.sent > 0 || stats.received > 0 {
			ratioCount++
			if stats.sent == 0 || stats.received == 0 {
				totalRatio += 0
			} else {
				totalRatio += float64(min(stats.sent, stats.received)) / float64(max(stats.sent, stats.received))
			}
		}
	}

	avgDelay := 0.0
	if delayCount > 0 {
		avgDelay = totalDelay / float64(delayCount)
	}

	avgRatio := 0.0
	if ratioCount > 0 {
		avgRatio = totalRatio / float64(ratioCount)
	}

	return avgDelay, avgRatio, totalMessages
}

func calculateActivityScore(userID uint, messages []models.Message, reportCount int) float64 {
	avgDelay, avgRatio, totalMessages := (&ChatService{}).calculateConversationMetrics(userID, messages)

	if totalMessages == 0 {
		penalty := math.Min(float64(reportCount)*20, 60)
		score := 20 - penalty
		if score < 0 {
			return 0
		}
		return score
	}

	messageScore := math.Min(float64(totalMessages)/40.0, 1.0)
	replyScore := math.Min(math.Max((7200.0-avgDelay)/7200.0, 0.0), 1.0)

	score := 20.0 + 80.0*(0.4*messageScore+0.3*replyScore+0.3*avgRatio)
	penalty := math.Min(float64(reportCount)*20.0, 60.0)
	score -= penalty

	if score < 0 {
		return 0
	}
	if score > 100 {
		return 100
	}

	return score
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func parseUint(value string) (uint, error) {
	parsed, err := strconv.ParseUint(value, 10, 64)
	return uint(parsed), err
}
