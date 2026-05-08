export interface WebSocketMessage {
  type: 'message' | 'typing' | 'message_delivered' | 'message_seen' | 'user_online' | 'user_offline';
  chat_id?: string;
  user_id?: string;
  content?: string;
  message_id?: string;
  timestamp?: string;
  is_typing?: boolean;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private messageHandlers: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private token: string | null = null;
  private isConnecting = false;

  constructor() {
    this.url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
  }

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        resolve();
        return;
      }

      this.isConnecting = true;
      this.token = token;

      try {
        this.ws = new WebSocket(`${this.url}?token=${token}`);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected');
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          this.emit('connected', {});
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data: WebSocketMessage = JSON.parse(event.data);
            console.log('📨 WS Message:', data.type, data);
            this.emit(data.type, data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('🔌 WebSocket disconnected');
          this.isConnecting = false;
          this.emit('disconnected', {});
          this.attemptReconnect(token);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private attemptReconnect(token: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
      console.log(`⏳ Reconnecting in ${delay}ms... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => {
        this.connect(token).catch(() => {});
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.emit('reconnect_failed', {});
    }
  }

  send(type: string, data: any): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
      return true;
    }
    console.warn('⚠️ WebSocket not connected, queuing message...');
    return false;
  }

  // Convenience methods
  sendMessage(chatId: string, content: string): boolean {
    return this.send('message', { chat_id: chatId, content, timestamp: new Date().toISOString() });
  }

  sendTyping(chatId: string, isTyping: boolean): boolean {
    return this.send('typing', { chat_id: chatId, is_typing: isTyping });
  }

  markMessageDelivered(messageId: string): boolean {
    return this.send('message_delivered', { message_id: messageId });
  }

  markMessageSeen(messageId: string): boolean {
    return this.send('message_seen', { message_id: messageId });
  }

  on(type: string, handler: Function): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)?.push(handler);
  }

  off(type: string, handler: Function): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(type: string, data: any): void {
    const handlers = this.messageHandlers.get(type) || [];
    handlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in handler for ${type}:`, error);
      }
    });
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsClient = new WebSocketClient();
