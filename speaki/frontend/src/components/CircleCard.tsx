'use client';

import { motion } from 'framer-motion';

interface CircleCardProps {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
  avatar?: string;
  onClick?: (id: string) => void;
  isJoined?: boolean;
}

export default function CircleCard({
  id,
  name,
  description,
  memberCount = 0,
  avatar,
  onClick,
  isJoined = false,
}: CircleCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={() => onClick?.(id)}
      className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-accent/50 group"
    >
      {/* Circle Header/Avatar */}
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-32 bg-gradient-to-br from-accent to-accent/40 group-hover:from-accent/80 group-hover:to-accent/30 transition-all duration-300" />
      )}

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-primary font-semibold text-lg line-clamp-2">{name}</h3>
          {isJoined && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-accent text-xs font-bold bg-accent/10 px-2 py-1 rounded-full flex-shrink-0 ml-2"
            >
              Joined
            </motion.span>
          )}
        </div>

        {description && (
          <p className="text-secondary text-sm line-clamp-2 mb-4">{description}</p>
        )}

        <div className="flex items-center justify-between">
          <motion.span className="text-secondary text-xs flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10.5 1.5H4a2.5 2.5 0 0 0-2.5 2.5v10A2.5 2.5 0 0 0 4 16.5h12a2.5 2.5 0 0 0 2.5-2.5V8" />
              <circle cx="12" cy="3" r="1.5" />
              <circle cx="7" cy="7" r="1.5" />
            </svg>
            {memberCount} members
          </motion.span>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            +
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
