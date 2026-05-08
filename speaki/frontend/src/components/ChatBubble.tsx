'use client';

import { motion } from 'framer-motion';

interface ChatBubbleProps {
  message: string;
  isOwn: boolean;
  timestamp?: string;
  avatar?: string;
  username?: string;
}

export default function ChatBubble({
  message,
  isOwn,
  timestamp,
  avatar,
  username,
}: ChatBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} w-full mb-4`}
    >
      <div className={`flex gap-3 max-w-xs ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isOwn && avatar && (
          <img
            src={avatar}
            alt={username}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
        )}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isOwn
              ? 'bg-accent text-white rounded-br-none'
              : 'bg-card text-primary rounded-bl-none'
          } shadow-sm`}
        >
          {!isOwn && username && (
            <p className="text-secondary text-xs font-medium mb-1">{username}</p>
          )}
          <p className="text-sm leading-relaxed break-words">{message}</p>
          {timestamp && (
            <p className={`text-xs mt-2 ${isOwn ? 'text-white/60' : 'text-secondary'}`}>
              {timestamp}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
