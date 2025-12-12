import { create } from 'zustand';
import type { Feed } from '@/domain/contracts';

interface FilterState {
  feedFilter: Feed | 'all';
  searchQuery: string;
  sortByTime: boolean;
  setFeedFilter: (feed: Feed | 'all') => void;
  setSearchQuery: (query: string) => void;
  toggleSortByTime: () => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterState>()((set) => ({
  feedFilter: 'all',
  searchQuery: '',
  sortByTime: false,
  setFeedFilter: (feed) => set({ feedFilter: feed }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleSortByTime: () =>
    set((state) => ({
      sortByTime: !state.sortByTime,
    })),
  clearFilters: () => set({ feedFilter: 'all', searchQuery: '', sortByTime: false }),
}));

interface CallDialogState {
  isOpen: boolean;
  stationId: string | null;
  stationName: string | null;
  callLetters: string | null;
  phoneId: string | null;
  phoneLabel: string | null;
  phoneNumber: string | null;
  openDialog: (data: {
    stationId: string;
    stationName: string;
    callLetters: string;
    phoneId: string;
    phoneLabel: string;
    phoneNumber: string;
  }) => void;
  closeDialog: () => void;
}

export const useCallDialogStore = create<CallDialogState>()((set) => ({
  isOpen: false,
  stationId: null,
  stationName: null,
  callLetters: null,
  phoneId: null,
  phoneLabel: null,
  phoneNumber: null,
  openDialog: (data) => set({ isOpen: true, ...data }),
  closeDialog: () =>
    set({
      isOpen: false,
      stationId: null,
      stationName: null,
      callLetters: null,
      phoneId: null,
      phoneLabel: null,
      phoneNumber: null,
    }),
}));

interface NotificationState {
  message: string | null;
  type: 'success' | 'error' | 'info';
  show: (message: string, type?: 'success' | 'error' | 'info') => void;
  hide: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  message: null,
  type: 'info',
  show: (message, type = 'info') => set({ message, type }),
  hide: () => set({ message: null }),
}));