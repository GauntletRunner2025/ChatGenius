import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProfileStore } from '../stores/profileStore';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDirectMessages, sendDirectMessage } from '../supabase';
import { supabase } from '../supabase';
import styles from './ProfilePage.module.css';

interface Message {
  id: string;
  sender: string;
  message: string;
}

export default function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading, error, fetchProfile, updateProfile } = useProfileStore();
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

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

  useEffect(() => {
    const loadMessages = async () => {
      const data = await fetchDirectMessages(userId!);
      setMessages(data);
    };

    loadMessages();
  }, [userId]);

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

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    const { data: { user } } = await supabase.auth.getUser();
    const sender = user?.id;
    if (!sender) return;

    await sendDirectMessage(sender, userId!, newMessage);
    setNewMessage('');
    const data = await fetchDirectMessages(userId!);
    setMessages(data);
  };

  if (!user) {
    return (
      <div className={styles.loadingContainer}>
        <p className={styles.loadingText}>Please log in to view profiles.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <p className={styles.loadingText}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {isOwnProfile ? 'Your Profile' : 'User Profile'}
        </h1>
        <button
          onClick={() => navigate('/main')}
          className={styles.backButton}
        >
          Back to Chat
        </button>
      </div>
      
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="bio" className={styles.label}>
            Bio
          </label>
          {isOwnProfile ? (
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              className={styles.textarea}
            />
          ) : (
            <div className={styles.bioDisplay}>
              {profile?.bio || 'This user hasn\'t written a bio yet.'}
            </div>
          )}
        </div>

        {saveMessage && (
          <div className={`${styles.saveMessage} ${
            saveMessage.includes('success')
              ? styles.saveMessageSuccess
              : styles.saveMessageError
          }`}>
            {saveMessage}
          </div>
        )}

        {isOwnProfile && (
          <button
            type="submit"
            disabled={isSaving}
            className={styles.button}
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        )}
      </form>

      <div className={styles.messagesSection}>
        <h3 className={styles.messagesTitle}>Direct Messages</h3>
        <div className={styles.messagesList}>
          {messages.map((msg) => (
            <div key={msg.id} className={styles.messageItem}>
              <span className={styles.messageSender}>
                {msg.sender === userId ? 'You' : 'Them'}:
              </span>
              {msg.message}
            </div>
          ))}
        </div>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className={styles.messageInput}
        />
        <button 
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          className={styles.sendButton}
        >
          Send
        </button>
      </div>
    </div>
  );
}