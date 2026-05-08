package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"speaki-backend/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type ChatHandler struct {
	upgrader    websocket.Upgrader
	authService *services.AuthService
	chatService *services.ChatService
	lock        sync.RWMutex
	connections map[string]*websocket.Conn
}

type ChatPayload struct {
	To      string `json:"to"`
	Message string `json:"message"`
}

type WSRequest struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

type SendMessagePayload struct {
	To      string `json:"to"`
	Message string `json:"message"`
}

type MessageSeenPayload struct {
	MessageID uint `json:"message_id"`
}

type MessageEventPayload struct {
	MessageID uint      `json:"message_id"`
	From      string    `json:"from,omitempty"`
	To        string    `json:"to,omitempty"`
	Message   string    `json:"message,omitempty"`
	Status    string    `json:"status,omitempty"`
	CreatedAt time.Time `json:"created_at,omitempty"`
}

type OutgoingMessage struct {
	Type    string              `json:"type"`
	Payload MessageEventPayload `json:"payload"`
}

type UserStatusMessage struct {
	Type    string          `json:"type"`
	Payload userStatusEvent `json:"payload"`
}

type userStatusEvent struct {
	UserID   string    `json:"user_id"`
	IsOnline bool      `json:"isOnline"`
	LastSeen time.Time `json:"lastSeen"`
}

func NewChatHandler(authService *services.AuthService, chatService *services.ChatService) *ChatHandler {
	return &ChatHandler{
		authService: authService,
		chatService: chatService,
		connections: make(map[string]*websocket.Conn),
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
	}
}

func (h *ChatHandler) Handle(c *gin.Context) {
	tokenString := h.extractToken(c)
	if tokenString == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing auth token"})
		return
	}

	claims, err := h.authService.ValidateToken(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
		return
	}

	userID := claims.Subject
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token claims"})
		return
	}

	conn, err := h.upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("websocket upgrade failed: %v", err)
		return
	}
	defer func() {
		h.removeConnection(userID)
		if err := h.chatService.SetUserOffline(userID); err != nil {
			log.Printf("failed to mark user offline: %v", err)
		}
		h.broadcastStatus(userID, false)
		if err := conn.Close(); err != nil {
			log.Printf("websocket close failed: %v", err)
		}
		log.Printf("websocket client disconnected: user=%s", userID)
	}()

	h.addConnection(userID, conn)
	if err := h.chatService.SetUserOnline(userID); err != nil {
		log.Printf("failed to mark user online: %v", err)
	}
	h.broadcastStatus(userID, true)
	log.Printf("websocket client connected: %s user=%s", c.ClientIP(), userID)

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Printf("websocket read error for user %s: %v", userID, err)
			break
		}

		var request WSRequest
		if err := json.Unmarshal(message, &request); err != nil {
			log.Printf("invalid websocket event from user %s: %v", userID, err)
			continue
		}

		switch request.Type {
		case "send_message":
			var payload SendMessagePayload
			if err := json.Unmarshal(request.Payload, &payload); err != nil {
				log.Printf("invalid send_message payload from user %s: %v", userID, err)
				continue
			}

			if payload.To == "" || payload.Message == "" {
				log.Printf("empty send_message payload from user %s", userID)
				continue
			}

			msg, err := h.chatService.SaveMessage(userID, payload.To, payload.Message)
			if err != nil {
				log.Printf("failed to save chat message from %s to %s: %v", userID, payload.To, err)
				continue
			}

			receiverConn := h.getConnection(payload.To)
			senderResponse := OutgoingMessage{
				Type: "send_message",
				Payload: MessageEventPayload{
					MessageID: msg.ID,
					To:        payload.To,
					Message:   msg.Content,
					Status:    msg.Status,
					CreatedAt: msg.CreatedAt,
				},
			}
			if err := h.sendEvent(conn, senderResponse); err != nil {
				log.Printf("failed to send acknowledgement to sender %s: %v", userID, err)
			}

			if receiverConn != nil {
				updatedMsg, err := h.chatService.MarkMessageDelivered(msg.ID)
				if err != nil {
					log.Printf("failed to mark message delivered for id %d: %v", msg.ID, err)
				} else {
					deliverEvent := OutgoingMessage{
						Type: "message_delivered",
						Payload: MessageEventPayload{
							MessageID: updatedMsg.ID,
							Status:    updatedMsg.Status,
						},
					}
					if err := h.sendEvent(conn, deliverEvent); err != nil {
						log.Printf("failed to notify sender %s of delivery: %v", userID, err)
					}
				}

				receiveEvent := OutgoingMessage{
					Type: "send_message",
					Payload: MessageEventPayload{
						MessageID: msg.ID,
						From:      userID,
						Message:   msg.Content,
						Status:    updatedMsg.Status,
						CreatedAt: msg.CreatedAt,
					},
				}
				if err := h.sendEvent(receiverConn, receiveEvent); err != nil {
					log.Printf("websocket write error to receiver %s: %v", payload.To, err)
				}
			}

		case "message_seen":
			var payload MessageSeenPayload
			if err := json.Unmarshal(request.Payload, &payload); err != nil {
				log.Printf("invalid message_seen payload from user %s: %v", userID, err)
				continue
			}

			receiverUID64, err := strconv.ParseUint(userID, 10, 64)
			if err != nil {
				log.Printf("invalid userID for seen event: %v", err)
				continue
			}
			receiverUID := uint(receiverUID64)

			updatedMsg, err := h.chatService.MarkMessageSeen(payload.MessageID, receiverUID)
			if err != nil {
				log.Printf("failed to mark message seen for id %d: %v", payload.MessageID, err)
				continue
			}

			senderConn := h.getConnection(strconv.FormatUint(uint64(updatedMsg.SenderID), 10))
			if senderConn != nil {
				seenEvent := OutgoingMessage{
					Type: "message_seen",
					Payload: MessageEventPayload{
						MessageID: updatedMsg.ID,
						Status:    updatedMsg.Status,
					},
				}
				if err := h.sendEvent(senderConn, seenEvent); err != nil {
					log.Printf("failed to notify sender %d of seen status: %v", updatedMsg.SenderID, err)
				}
			}

		default:
			log.Printf("unsupported websocket event type from user %s: %s", userID, request.Type)
		}
	}
}

func (h *ChatHandler) extractToken(c *gin.Context) string {
	authHeader := c.GetHeader("Authorization")
	if strings.HasPrefix(strings.TrimSpace(authHeader), "Bearer ") {
		return strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))
	}

	return strings.TrimSpace(c.Query("token"))
}

func (h *ChatHandler) sendEvent(conn *websocket.Conn, event OutgoingMessage) error {
	encoded, err := json.Marshal(event)
	if err != nil {
		return err
	}

	return conn.WriteMessage(websocket.TextMessage, encoded)
}

func (h *ChatHandler) addConnection(userID string, conn *websocket.Conn) {
	h.lock.Lock()
	defer h.lock.Unlock()
	h.connections[userID] = conn
}

func (h *ChatHandler) getConnection(userID string) *websocket.Conn {
	h.lock.RLock()
	defer h.lock.RUnlock()
	return h.connections[userID]
}

func (h *ChatHandler) broadcastStatus(userID string, isOnline bool) {
	var lastSeen time.Time
	if !isOnline {
		lastSeen = time.Now()
	}

	message := UserStatusMessage{
		Type: "user_status",
		Payload: userStatusEvent{
			UserID:   userID,
			IsOnline: isOnline,
			LastSeen: lastSeen,
		},
	}

	encoded, err := json.Marshal(message)
	if err != nil {
		log.Printf("failed to marshal status update for user %s: %v", userID, err)
		return
	}

	h.lock.RLock()
	defer h.lock.RUnlock()
	for _, conn := range h.connections {
		if conn == nil {
			continue
		}
		if err := conn.WriteMessage(websocket.TextMessage, encoded); err != nil {
			log.Printf("failed to broadcast status to connection: %v", err)
		}
	}
}

func (h *ChatHandler) removeConnection(userID string) {
	h.lock.Lock()
	defer h.lock.Unlock()
	delete(h.connections, userID)
}
