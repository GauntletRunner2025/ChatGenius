import { create, supabase, type ChannelStore } from '../imports/stores/channel.imports';

export const useChannelStore = create<ChannelStore>((set, get) => ({
  channels: [],
  joinedChannels: new Set(),
  selectedChannel: null,
  loading: false,
  error: null,

  fetchChannels: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('inserted_at', { ascending: true });

      if (error) throw error;

      set({ 
        channels: data,
        selectedChannel: get().selectedChannel || (data.length > 0 ? data[0] : null)
      });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchJoinedChannels: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('joined_channel')
        .select('channel_id')
        .eq('user_id', user.id);

      if (error) throw error;

      set({ 
        joinedChannels: new Set(data.map(row => row.channel_id))
      });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  selectChannel: (channel) => set({ selectedChannel: channel }),

  createChannel: async (slug: string, userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data: existingChannel } = await supabase
        .from('channels')
        .select()
        .eq('slug', slug)
        .single();

      if (existingChannel) {
        throw new Error('A channel with this name already exists');
      }

      const { data, error } = await supabase
        .from('channels')
        .insert([
          {
            slug: slug.toLowerCase().replace(/\s+/g, '-'),
            created_by: userId
          }
        ])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('A channel with this name already exists');
        }
        throw error;
      }

      // Auto-join the channel when creating it
      await supabase
        .from('joined_channel')
        .insert([
          {
            channel_id: data.id,
            user_id: userId
          }
        ]);

      set((state) => ({
        channels: [...state.channels, data],
        selectedChannel: data,
        joinedChannels: new Set([...state.joinedChannels, data.id])
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  joinChannel: async (channelId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('joined_channel')
        .insert([
          {
            channel_id: channelId,
            user_id: user.id
          }
        ]);

      if (error) throw error;

      set((state) => ({
        joinedChannels: new Set([...state.joinedChannels, channelId])
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  leaveChannel: async (channelId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('joined_channel')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', user.id);

      if (error) throw error;

      set((state) => {
        const newJoinedChannels = new Set(state.joinedChannels);
        newJoinedChannels.delete(channelId);
        
        // If the selected channel is the one we're leaving, clear it
        const newSelectedChannel = state.selectedChannel?.id === channelId 
          ? null 
          : state.selectedChannel;

        return {
          joinedChannels: newJoinedChannels,
          selectedChannel: newSelectedChannel
        };
      });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  isJoined: (channelId: number) => {
    return get().joinedChannels.has(channelId);
  }
})); 