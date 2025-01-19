import { create } from 'zustand';
import { supabase } from '../supabase';

export interface Message {
  id: number;
  message: string;
  channel_id: number;
  user_id: string;
  inserted_at: string;
}

interface MessageStore {
  messages: Record<number, Message[]>;
  loading: boolean;
  error: string | null;
  fetchMessages: (channelId: number, forceRefresh?: boolean) => Promise<void>;
  sendMessage: (channelId: number, message: string, userId: string) => Promise<void>;
  hasMessages: (channelId: number) => boolean;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: {},
  loading: false,
  error: null,

  hasMessages: (channelId: number) => {
    return !!get().messages[channelId];
  },

  fetchMessages: async (channelId: number, forceRefresh: boolean = false) => {
    // If we have messages and don't want to force refresh, skip fetching
    if (!forceRefresh && get().hasMessages(channelId)) {
      return;
    }

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('inserted_at', { ascending: true });

      if (error) throw error;

      set((state) => ({
        messages: {
          ...state.messages,
          [channelId]: data || []
        }
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  sendMessage: async (channelId: number, message: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            message,
            channel_id: channelId,
            user_id: userId
          }
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set((state) => ({
          messages: {
            ...state.messages,
            [channelId]: [...(state.messages[channelId] || []), data]
          }
        }));
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  }
})); 