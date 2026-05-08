'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import UserCard from '@/components/UserCard';
import { userAPI } from '@/lib/api';
import { useUserStore } from '@/store/useUserStore';

interface User {
  id: string;
  username: string;
  interests?: string[];
  intent?: string;
  online_status?: boolean;
  avatar_url?: string;
}

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useUserStore();

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    const fetchMatches = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getMatches();
        setUsers(response.data || []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching matches:', err);
        setError(err.response?.data?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [isAuthenticated]);

  const handleUserClick = (userId: string) => {
    window.location.href = `/chat/${userId}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar currentPage="home" />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3">
            Discover People
          </h1>
          <p className="text-secondary text-lg">
            Find interesting people to chat with based on your interests
          </p>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-8 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                className="bg-card border border-border rounded-2xl p-6 h-64"
              />
            ))}
          </div>
        )}

        {/* Users Grid */}
        {!loading && users.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {users.map((user) => (
              <motion.div key={user.id} variants={itemVariants}>
                <UserCard
                  id={user.id}
                  username={user.username}
                  interests={user.interests}
                  intent={user.intent}
                  onlineStatus={user.online_status}
                  avatar={user.avatar_url}
                  onClick={handleUserClick}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && users.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">No users found</h2>
            <p className="text-secondary max-w-md">
              Check back soon! More people will be available to connect with.
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
