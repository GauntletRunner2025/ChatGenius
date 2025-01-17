import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProfileStore } from '../stores/profileStore';
import { useParams, useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading, error, fetchProfile, updateProfile } = useProfileStore();
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const isOwnProfile = user?.id === (userId || user?.id);
  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchProfile(targetUserId);
    }
  }, [targetUserId, fetchProfile]);

  useEffect(() => {
    if (profile?.bio) {
      setBio(profile.bio);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isOwnProfile) return;

    setIsSaving(true);
    setSaveMessage('');
    
    try {
      await updateProfile(user.id, bio);
      setSaveMessage('Profile updated successfully!');
      // Navigate back to main chat after a short delay
      setTimeout(() => {
        navigate('/main');
      }, 1000);
    } catch (error) {
      setSaveMessage('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Please log in to view profiles.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-200">
          {isOwnProfile ? 'Your Profile' : 'User Profile'}
        </h1>
        <button
          onClick={() => navigate('/main')}
          className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded transition-colors"
        >
          Back to Chat
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/20 rounded text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
            Bio
          </label>
          {isOwnProfile ? (
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full px-3 py-2 bg-gray-700/30 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-200 placeholder-gray-400"
            />
          ) : (
            <div className="w-full px-3 py-2 bg-gray-700/30 border border-gray-600 rounded-lg text-gray-200">
              {profile?.bio || 'This user hasn\'t written a bio yet.'}
            </div>
          )}
        </div>

        {saveMessage && (
          <div className={`p-3 rounded ${
            saveMessage.includes('success')
              ? 'bg-green-900/20 border border-green-500/20 text-green-400'
              : 'bg-red-900/20 border border-red-500/20 text-red-400'
          }`}>
            {saveMessage}
          </div>
        )}

        {isOwnProfile && (
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        )}
      </form>
    </div>
  );
} 