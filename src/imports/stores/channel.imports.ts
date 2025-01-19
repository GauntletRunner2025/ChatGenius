import { create } from 'zustand';
import { supabase } from '../../supabase';
import { type Channel } from '../types/entities.imports';

export interface ChannelStore {
    channels: Channel[];
    joinedChannels: Set<number>;
    selectedChannel: Channel | null;
    loading: boolean;
    error: string | null;
    fetchChannels: () => Promise<void>;
    fetchJoinedChannels: () => Promise<void>;
    selectChannel: (channel: Channel) => void;
    createChannel: (slug: string, userId: string) => Promise<void>;
    joinChannel: (channelId: number) => Promise<void>;
    leaveChannel: (channelId: number) => Promise<void>;
    isJoined: (channelId: number) => boolean;
}

export { create, supabase, type Channel }; 