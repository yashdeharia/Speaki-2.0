'use client';

import { motion } from 'framer-motion';

interface UserCardProps {
  id: string;
  username: string;
  interests?: string[];
  intent?: string;
  onlineStatus?: boolean;
  avatar?: string;
  onClick?: (id: string) => void;
}

export default function UserCard({
  id,
  username,
  interests = [],
  intent,
  onlineStatus = false,
  avatar,
  onClick,
}: UserCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={() => onClick?.(id)}
      className="bg-card border border-border rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:border-accent/50 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4 flex-1">
          {avatar ? (
            <img
              src={avatar}
              alt={username}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center text-white font-semibold text-sm">
              {username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-primary font-semibold truncate">{username}</h3>
            <p className="text-secondary text-sm">{intent || 'Open to chat'}</p>
          </div>
        </div>
        {onlineStatus && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"
          />
        )}
      </div>

      {interests && interests.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {interests.slice(0, 3).map((interest, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full border border-accent/20"
            >
              {interest}
            </motion.span>
          ))}
          {interests.length > 3 && (
            <span className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full border border-accent/20">
              +{interests.length - 3}
            </span>
          )}
        </div>
      )}

      <motion.button
        whileHover={{ backgroundColor: '#6366f1' }}
        className="w-full bg-accent/20 text-accent font-medium py-2 rounded-lg text-sm transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
      >
        Connect
      </motion.button>
    </motion.div>
  );
}
