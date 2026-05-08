'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/useUserStore';
import { userAPI } from '@/lib/api';

const POPULAR_INTERESTS = [
  'Technology',
  'Music',
  'Gaming',
  'Sports',
  'Art',
  'Travel',
  'Fitness',
  'Cooking',
  'Movies',
  'Books',
  'Photography',
  'Fashion',
  'Coding',
  'Design',
  'Writing',
  'Business',
];

const INTENTS = [
  { value: 'friendship', label: 'Make Friends' },
  { value: 'dating', label: 'Dating' },
  { value: 'community', label: 'Find Community' },
  { value: 'learning', label: 'Learn & Grow' },
  { value: 'professional', label: 'Professional Network' },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedIntent, setSelectedIntent] = useState<string>('');
  const [customInterest, setCustomInterest] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, isAuthenticated, setCurrentUser } = useUserStore();

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
  }, [isAuthenticated]);

  const handleAddCustomInterest = () => {
    if (customInterest.trim() && !selectedInterests.includes(customInterest.trim())) {
      setSelectedInterests([...selectedInterests, customInterest.trim()]);
      setCustomInterest('');
    }
  };

  const handleToggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleRemoveInterest = (interest: string) => {
    setSelectedInterests(prev => prev.filter(i => i !== interest));
  };

  const handleComplete = async () => {
    if (selectedInterests.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    if (!selectedIntent) {
      setError('Please select your intention');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!currentUser) throw new Error('No current user');

      const updateData = {
        interests: selectedInterests,
        intent: selectedIntent,
      };

      const response = await userAPI.updateProfile(currentUser.id, updateData);
      const updatedUser = { ...currentUser, ...response.data };
      setCurrentUser(updatedUser);

      window.location.href = '/home';
    } catch (err: any) {
      console.error('Error completing onboarding:', err);
      setError(err.response?.data?.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg to-card flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center">
            <span className="text-white text-xl font-bold">S</span>
          </div>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-card border border-border rounded-3xl p-8 shadow-lg"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-primary mb-2">
              {step === 1 ? 'What are your interests?' : 'What brings you here?'}
            </h1>
            <p className="text-secondary">
              {step === 1
                ? 'Select topics you care about to get better matches'
                : "Help us understand what you're looking for"}
            </p>
          </motion.div>

          {/* Step Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-2 mb-8"
          >
            {[1, 2].map((s) => (
              <motion.div
                key={s}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  step >= s ? 'bg-accent' : 'bg-border'
                }`}
              />
            ))}
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Step 1: Interests Selection */}
          {step === 1 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Popular Interests */}
              <motion.div variants={itemVariants} className="mb-8">
                <p className="text-primary text-sm font-medium mb-4">Popular interests:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {POPULAR_INTERESTS.map((interest) => (
                    <motion.button
                      key={interest}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleToggleInterest(interest)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                        selectedInterests.includes(interest)
                          ? 'bg-accent text-white border-accent'
                          : 'bg-bg border-border text-secondary hover:border-accent'
                      }`}
                    >
                      {interest}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Custom Interest Input */}
              <motion.div variants={itemVariants} className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customInterest}
                    onChange={(e) => setCustomInterest(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomInterest();
                      }
                    }}
                    placeholder="Add your own interest..."
                    className="flex-1 bg-bg border border-border rounded-xl px-4 py-3 text-primary placeholder-secondary focus:outline-none focus:border-accent transition-colors text-sm"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddCustomInterest}
                    className="bg-accent text-white px-4 py-3 rounded-xl font-medium text-sm"
                  >
                    Add
                  </motion.button>
                </div>
              </motion.div>

              {/* Selected Interests */}
              {selectedInterests.length > 0 && (
                <motion.div variants={itemVariants} className="mb-8">
                  <p className="text-primary text-sm font-medium mb-3">
                    Selected ({selectedInterests.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedInterests.map((interest) => (
                      <motion.span
                        key={interest}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="bg-accent/20 text-accent px-3 py-1.5 rounded-full text-sm border border-accent/30 flex items-center gap-2"
                      >
                        {interest}
                        <button
                          onClick={() => handleRemoveInterest(interest)}
                          className="text-accent hover:text-accent/80 transition-colors"
                        >
                          ✕
                        </button>
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Next Button */}
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep(2)}
                disabled={selectedInterests.length === 0}
                className="w-full bg-accent text-white py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Intent Selection */}
          {step === 2 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <p className="text-primary text-sm font-medium mb-4">Choose your intention:</p>

              <div className="space-y-3 mb-8">
                {INTENTS.map((intent) => (
                  <motion.button
                    key={intent.value}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedIntent(intent.value)}
                    className={`w-full px-6 py-4 rounded-xl text-left font-medium transition-all border-2 ${
                      selectedIntent === intent.value
                        ? 'bg-accent/20 border-accent text-accent'
                        : 'bg-bg border-border text-secondary hover:border-accent/50'
                    }`}
                  >
                    {intent.label}
                  </motion.button>
                ))}
              </div>

              {/* Action Buttons */}
              <motion.div variants={itemVariants} className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep(1)}
                  className="flex-1 bg-bg border border-border text-primary py-3 rounded-xl font-medium hover:border-secondary transition-colors"
                >
                  Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleComplete}
                  disabled={!selectedIntent || loading}
                  className="flex-1 bg-accent text-white py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Completing...' : 'Complete Setup'}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-secondary text-xs mt-6"
        >
          You can change these anytime in your profile
        </motion.p>
      </motion.div>
    </div>
  );
}
