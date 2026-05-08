'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ChatBubble from '@/components/ChatBubble';
import { chatAPI } from '@/lib/api';
import { wsClient } from '@/lib/websocket';
import { useUserStore } from '@/store/useUserStore';

interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  username?: string;
  avatar_url?: string;
  status?: 'sent' | 'delivered' | 'seen';
}

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const { currentUser, isAuthenticated, token, setActiveChatId, setWSConnected } = useUserStore();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    setActiveChatId(chatId);

    const initialize = async () => {
      try {
        setLoading(true);
        // Fetch initial messages
        const response = await chatAPI.getMessages(chatId);
        setMessages(response.data || []);

        // Connect WebSocket
        if (token) {
          await wsClient.connect(token);
          setWSConnected(true);

          // Listen for incoming messages
          wsClient.on('message', (data: any) => {
            if (data.chat_id === chatId) {
              setMessages((prev) => [...prev, {
                id: data.message_id,
                user_id: data.user_id,
                content: data.content,
                created_at: data.timestamp || new Date().toISOString(),
                username: data.username,
                avatar_url: data.avatar_url,
                status: 'seen',
              }]);
              // Mark as seen
              if (data.message_id) {
                wsClient.markMessageSeen(data.message_id);
              }
            }
          });

          // Listen for typing indicator
          wsClient.on('typing', (data: any) => {
            if (data.chat_id === chatId && data.user_id !== currentUser?.id) {
              setOtherUserTyping(data.is_typing || false);
            }
          });

          // Listen for message delivered
          wsClient.on('message_delivered', (data: any) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === data.message_id ? { ...msg, status: 'delivered' } : msg
              )
            );
          });

          // Listen for message seen
          wsClient.on('message_seen', (data: any) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === data.message_id ? { ...msg, status: 'seen' } : msg
              )
            );
          });
        }
      } catch (err) {
        console.error('Error initializing chat:', err);
      } finally {
        setLoading(false);
      }
    };

    initialize();

    return () => {
      setActiveChatId(null);
    };
  }, [chatId, isAuthenticated, token, currentUser?.id, setActiveChatId, setWSConnected]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      // Send via WebSocket if connected, otherwise via HTTP
      if (wsClient.isConnected()) {
        const sent = wsClient.sendMessage(chatId, newMessage);
        if (sent) {
          // Optimistic update
          setMessages((prev) => [...prev, {
            id: `temp-${Date.now()}`,
            user_id: currentUser?.id || '',
            content: newMessage,
            created_at: new Date().toISOString(),
            username: currentUser?.username,
            avatar_url: currentUser?.avatar_url,
            status: 'sent',
          }]);
          setNewMessage('');
        } else {
          // Fallback to HTTP
          await chatAPI.sendMessage(chatId, newMessage);
          const response = await chatAPI.getMessages(chatId);
          setMessages(response.data || []);
          setNewMessage('');
        }
      } else {
        // Use HTTP fallback
        await chatAPI.sendMessage(chatId, newMessage);
        const response = await chatAPI.getMessages(chatId);
        setMessages(response.data || []);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
      setIsTyping(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      wsClient.sendTyping(chatId, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      wsClient.sendTyping(chatId, false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar currentPage="chat" />

      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-6 py-8">
        {/* Chat Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-primary">Conversation</h1>
          <p className="text-secondary text-sm">Chat with your match</p>
        </motion.div>

        {/* Messages Container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 bg-card border border-border rounded-2xl p-6 mb-6 overflow-y-auto flex flex-col"
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-secondary"
              >
                Loading messages...
              </motion.div>
            </div>
          ) : messages.length > 0 ? (
            <div className="flex flex-col gap-4 justify-end">
              <AnimatePresence>
                {messages.map((msg) => (
                  <ChatBubble
                    key={msg.id}
                    message={msg.content}
                    isOwn={msg.user_id === currentUser?.id}
                    timestamp={new Date(msg.created_at).toLocaleTimeString()}
                    username={msg.username}
                    avatar={msg.avatar_url}
                  />
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {otherUserTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-2 items-center"
                >
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-secondary rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                      className="w-2 h-2 bg-secondary rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-secondary rounded-full"
                    />
                  </div>
                  <span className="text-secondary text-xs">Someone is typing...</span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-secondary">
              <p>No messages yet. Start a conversation!</p>
            </div>
          )}
        </motion.div>

        {/* Input Area */}
        <motion.form
          onSubmit={handleSendMessage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4"
        >
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 bg-card border border-border rounded-2xl px-6 py-3 text-primary placeholder-secondary focus:outline-none focus:border-accent transition-colors"
            disabled={sending}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={sending || !newMessage.trim()}
            className="bg-accent text-white px-6 py-3 rounded-2xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
          >
            {sending ? 'Sending...' : 'Send'}
          </motion.button>
        </motion.form>
      </main>
    </div>
  );
}
