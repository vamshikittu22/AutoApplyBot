import { create } from 'zustand';
import type { Profile } from '@/types/profile';

type ProfileStore = {
  profile: Profile | null;
  isLoading: boolean;
  
  // Actions
  setProfile: (profile: Profile) => void;
  clearProfile: () => void;
  setLoading: (loading: boolean) => void;
};

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  isLoading: false,

  setProfile: (profile: Profile) => set({ profile, isLoading: false }),
  clearProfile: () => set({ profile: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
