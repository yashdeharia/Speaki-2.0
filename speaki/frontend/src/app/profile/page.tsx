'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { userAPI } from '@/lib/api';
import { useUserStore } from '@/store/useUserStore';

export default function ProfilePage() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser, isAuthenticated, setCurrentUser } = useUserStore();

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    if (currentUser) {
      setBio(currentUser.bio || '');
      setInterests(currentUser.interests || []);
    }
  }, [currentUser, isAuthenticated]);

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest)) {
      setInterests([...interests, newInterest]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const updateData = {
        bio,
        interests,
      };
      const response = await userAPI.updateProfile(currentUser.id, updateData);
      const updatedUser = { ...currentUser, ...response.data };
      setCurrentUser(updatedUser);
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar currentPage="profile" />

      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-card border border-border rounded-3xl p-8 mb-8"
        >
          {/* Header with Edit Button */}
          <div className="flex items-start justify-between mb-8">
            <h1 className="text-3xl font-bold text-primary">Profile</h1>
            {!isEditingProfile && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditingProfile(true)}
                className="bg-accent text-white px-6 py-2 rounded-lg font-medium text-sm"
              >
                Edit Profile
              </motion.button>
            )}
          </div>

          {currentUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              {/* Avatar and Basic Info */}
              <div className="flex gap-6 items-start">
                <img
                  src={currentUser.avatar_url || ''}
                  alt={currentUser.username}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-primary mb-1">
                    {currentUser.username}
                  </h2>
                  <p className="text-secondary text-sm">{currentUser.email}</p>
                </div>
              </div>

              {/* Bio Section */}
              {isEditingProfile ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-primary font-medium mb-2">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-primary placeholder-secondary focus:outline-none focus:border-accent resize-none"
                      rows={4}
                    />
                  </div>

                  {/* Interests Editor */}
                  <div>
                    <label className="block text-primary font-medium mb-2">
                      Interests
                    </label>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddInterest();
                          }
                        }}
                        placeholder="Add an interest..."
                        className="flex-1 bg-bg border border-border rounded-xl px-4 py-2 text-primary placeholder-secondary focus:outline-none focus:border-accent"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddInterest}
                        type="button"
                        className="bg-accent text-white px-4 py-2 rounded-xl font-medium"
                      >
                        Add
                      </motion.button>
                    </div>

                    {/* Interest Tags */}
                    <div className="flex flex-wrap gap-2">
                      {interests.map((interest, idx) => (
                        <motion.span
                          key={idx}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="bg-accent/10 text-accent px-4 py-2 rounded-full text-sm flex items-center gap-2 border border-accent/20"
                        >
                          {interest}
                          <button
                            onClick={() => handleRemoveInterest(interest)}
                            type="button"
                            className="hover:text-accent/70"
                          >
                            ×
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Save/Cancel Buttons */}
                  <div className="flex gap-4 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="flex-1 bg-accent text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50"
                      type="button"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditingProfile(false)}
                      className="flex-1 bg-border text-primary px-6 py-3 rounded-xl font-medium"
                      type="button"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <>
                  {bio && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <h3 className="text-primary font-medium mb-2">Bio</h3>
                      <p className="text-secondary">{bio}</p>
                    </motion.div>
                  )}

                  {interests.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <h3 className="text-primary font-medium mb-3">Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {interests.map((interest, idx) => (
                          <motion.span
                            key={idx}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-accent/10 text-accent px-4 py-2 rounded-full text-sm border border-accent/20"
                          >
                            {interest}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
