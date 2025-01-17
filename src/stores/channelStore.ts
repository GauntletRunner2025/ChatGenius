import { create } from 'zustand';
import { supabase } from '../supabase';

interface Channel {
  id: number;
  slug: string;
  inserted_at: string;
  created_by: string;
}

interface ChannelStore {
  channels: Channel[];
  selectedChannel: Channel | null;
  loading: boolean;
  error: string | null;
  fetchChannels: () => Promise<void>;
  selectChannel: (channel: Channel) => void;
  createChannel: (slug: string, userId: string) => Promise<void>;
}

export const useChannelStore = create<ChannelStore>((set) => ({
  channels: [],
  selectedChannel: null,
  loading: false,
  error: null,
  fetchChannels: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('channel')
        .select('*')
        .order('inserted_at', { ascending: true });

      if (error) throw error;

      set({ 
        channels: data,
        selectedChannel: data.length > 0 ? data[0] : null 
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
  selectChannel: (channel) => set({ selectedChannel: channel }),
  createChannel: async (slug: string, userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('channel')
        .insert([
          {
            slug: slug.toLowerCase().replace(/\s+/g, '-'),
            created_by: userId
          }
        ])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Postgres unique violation code
          throw new Error('A channel with this name already exists');
        }
        throw error;
      }

      set((state) => ({
        channels: [...state.channels, data],
        selectedChannel: data
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error; // Re-throw to handle in component
    } finally {
      set({ loading: false });
    }
  }
})); 