'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import CircleCard from '@/components/CircleCard';
import { circleAPI } from '@/lib/api';
import { useUserStore } from '@/store/useUserStore';

interface Circle {
  id: string;
  name: string;
  description?: string;
  member_count?: number;
  avatar_url?: string;
  is_member?: boolean;
}

export default function CirclesPage() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useUserStore();

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    const fetchCircles = async () => {
      try {
        setLoading(true);
        const response = await circleAPI.getCircles();
        setCircles(response.data || []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching circles:', err);
        setError(err.response?.data?.message || 'Failed to load circles');
      } finally {
        setLoading(false);
      }
    };

    fetchCircles();
  }, [isAuthenticated]);

  const handleCircleClick = (circleId: string) => {
    window.location.href = `/circles/${circleId}`;
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
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar currentPage="circles" />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3">
              Circles
            </h1>
            <p className="text-secondary text-lg">
              Join communities based on your interests
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-accent text-white px-6 py-3 rounded-xl font-medium"
          >
            + Create Circle
          </motion.button>
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
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                className="bg-card border border-border rounded-2xl h-64"
              />
            ))}
          </div>
        )}

        {/* Circles Grid */}
        {!loading && circles.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {circles.map((circle) => (
              <motion.div key={circle.id} variants={itemVariants}>
                <CircleCard
                  id={circle.id}
                  name={circle.name}
                  description={circle.description}
                  memberCount={circle.member_count}
                  avatar={circle.avatar_url}
                  onClick={handleCircleClick}
                  isJoined={circle.is_member}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && circles.length === 0 && !error && (
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
            <h2 className="text-2xl font-bold text-primary mb-2">No circles yet</h2>
            <p className="text-secondary max-w-md">
              Create your first circle or browse existing communities to join!
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
