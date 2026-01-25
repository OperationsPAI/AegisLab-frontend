/**
 * Profile Store
 * Manages starred projects state with localStorage persistence
 */
import { create } from 'zustand';

import { profileApi } from '@/api/profile';

interface ProfileState {
  starredProjectIds: number[];
  isLoading: boolean;

  // Actions
  loadStarredProjects: () => Promise<void>;
  toggleStar: (projectId: number) => Promise<void>;
  isStarred: (projectId: number) => boolean;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  starredProjectIds: [],
  isLoading: false,

  loadStarredProjects: async () => {
    set({ isLoading: true });
    try {
      const ids = await profileApi.getStarredProjectIds();
      set({ starredProjectIds: ids, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  toggleStar: async (projectId: number) => {
    const { starredProjectIds } = get();
    const isCurrentlyStarred = starredProjectIds.includes(projectId);

    // Optimistic update
    if (isCurrentlyStarred) {
      set({
        starredProjectIds: starredProjectIds.filter((id) => id !== projectId),
      });
    } else {
      set({
        starredProjectIds: [...starredProjectIds, projectId],
      });
    }

    try {
      await profileApi.toggleStar(projectId);
    } catch {
      // Revert on error
      set({ starredProjectIds });
    }
  },

  isStarred: (projectId: number) => {
    return get().starredProjectIds.includes(projectId);
  },
}));
