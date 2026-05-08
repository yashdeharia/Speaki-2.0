import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  email: string;
  interests?: string[];
  online_status?: boolean;
  avatar_url?: string;
  bio?: string;
}

interface UserStore {
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
  wsConnected: boolean;
  activeChatId: string | null;
  setCurrentUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  login: (user: User, token: string) => void;
  setWSConnected: (connected: boolean) => void;
  setActiveChatId: (chatId: string | null) => void;
  initializeFromStorage: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  currentUser: null,
  token: null,
  isAuthenticated: false,
  wsConnected: false,
  activeChatId: null,

  setCurrentUser: (user) =>
    set({
      currentUser: user,
      isAuthenticated: user !== null,
    }),

  setToken: (token) =>
    set({
      token,
      isAuthenticated: token !== null,
    }),

  setWSConnected: (connected) =>
    set({ wsConnected: connected }),

  setActiveChatId: (chatId) =>
    set({ activeChatId: chatId }),

  login: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({
      currentUser: user,
      token,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      currentUser: null,
      token: null,
      isAuthenticated: false,
      wsConnected: false,
      activeChatId: null,
    });
  },

  initializeFromStorage: () => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        set({
          token,
          currentUser: parsedUser,
          isAuthenticated: true,
        });
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
  },
}));
