package models

import "time"

// HealthResponse is returned for health check requests.
type HealthResponse struct {
	Status string `json:"status"`
}

// AuthRequest is used for register and login payloads.
type AuthRequest struct {
	Email      string   `json:"email" binding:"required,email"`
	Password   string   `json:"password" binding:"required,min=8"`
	Interests  []string `json:"interests,omitempty"`
	Intent     string   `json:"intent,omitempty"`
	Location   string   `json:"location,omitempty"`
	Activities []string `json:"activities,omitempty"`
}

// AuthResponse is returned after successful registration.
type AuthResponse struct {
	Email string `json:"email"`
}

// TokenResponse contains a JWT token.
type TokenResponse struct {
	Token string `json:"token"`
}

// LoginResponse contains token and user data.
type LoginResponse struct {
	Token string       `json:"token"`
	User  UserResponse `json:"user"`
}

// UserResponse is the user data returned to clients.
type UserResponse struct {
	ID           string   `json:"id"`
	Username     string   `json:"username"`
	Email        string   `json:"email"`
	Interests    []string `json:"interests"`
	Intent       string   `json:"intent"`
	AvatarURL    string   `json:"avatar_url"`
	Bio          string   `json:"bio"`
	OnlineStatus bool     `json:"online_status"`
}

// User represents the database user model.
type User struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Email         string    `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash  string    `gorm:"not null" json:"-"`
	Interests     []string  `gorm:"serializer:json" json:"interests"`
	Intent        string    `json:"intent"`                            // e.g., "dating", "friendship", "networking"
	Location      string    `json:"location"`                          // city or region
	Activities    []string  `gorm:"serializer:json" json:"activities"` // preferred activities
	ActivityScore float64   `gorm:"type:real;default:0" json:"activity_score"`
	IsOnline      bool      `gorm:"default:false" json:"isOnline"`
	LastSeen      time.Time `json:"lastSeen"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// MatchResult represents a user match with calculated score.
type MatchResult struct {
	User  User `json:"user"`
	Score int  `json:"score"`
}

// Circle represents a user circle/group.
type Circle struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"not null" json:"name"`
	Theme     string         `gorm:"not null" json:"theme"` // Main interest/theme
	CreatedAt time.Time      `json:"created_at"`
	ExpiresAt time.Time      `gorm:"not null" json:"expires_at"`
	Members   []CircleMember `gorm:"constraint:OnDelete:CASCADE;" json:"members,omitempty"`
}

// CircleMember represents a user's membership in a circle.
type CircleMember struct {
	ID       uint      `gorm:"primaryKey" json:"id"`
	CircleID uint      `gorm:"not null;index;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"circle_id"`
	UserID   uint      `gorm:"not null;index;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"user_id"`
	JoinedAt time.Time `json:"joined_at"`
	Circle   Circle    `gorm:"foreignKey:CircleID" json:"-"`
	User     User      `gorm:"foreignKey:UserID" json:"-"`
}

type UserReport struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	ReporterID uint      `gorm:"not null;index" json:"reporter_id"`
	ReportedID uint      `gorm:"not null;index" json:"reported_id"`
	Reason     string    `gorm:"not null" json:"reason"`
	CreatedAt  time.Time `json:"created_at"`
}

type UserBlock struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	BlockerID uint      `gorm:"not null;index;uniqueIndex:idx_user_block_pair" json:"blocker_id"`
	BlockedID uint      `gorm:"not null;index;uniqueIndex:idx_user_block_pair" json:"blocked_id"`
	CreatedAt time.Time `json:"created_at"`
}

type Message struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	SenderID   uint      `gorm:"not null;index" json:"sender_id"`
	ReceiverID uint      `gorm:"not null;index" json:"receiver_id"`
	Content    string    `gorm:"not null" json:"content"`
	Status     string    `gorm:"type:text;not null;default:'sent'" json:"status"`
	CreatedAt  time.Time `json:"created_at"`
}

// WSMessage is a reusable model for WebSocket payloads.
type WSMessage struct {
	Payload string `json:"payload"`
}
