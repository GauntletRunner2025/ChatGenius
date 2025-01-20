import React, { useEffect } from 'react';
import { useMessageStore } from '../../../stores/messageStore';
import { useChannelStore } from '../../../stores/channelStore';
import { useAuth } from '../../../contexts/AuthContext';
import { format } from 'date-fns';
import { supabase } from '../../../supabase';

export type ChatMessagesProps = {
  channelId: number;
};

export {
  React,
  useEffect,
  useMessageStore,
  useChannelStore,
  useAuth,
  format,
  supabase
}; 