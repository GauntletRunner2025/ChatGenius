import { create } from 'zustand';
import { supabase } from '../supabase';

interface Profile {
  id: string;
  bio: string | null;
  updated_at: string;
}

interface ProfileStore {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (userId: string, bio: string) => Promise<void>;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      set({ profile: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (userId: string, bio: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('profile')
        .upsert({
          id: userId,
          bio,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      set((state) => ({
        profile: {
          ...(state.profile || { id: userId }),
          bio,
          updated_at: new Date().toISOString()
        }
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  }
})); 