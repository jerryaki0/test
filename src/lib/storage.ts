const STORAGE_KEY = 'community_help_user';

export interface StoredUser {
  id: string;
  email: string;
  username: string;
}

export const getStoredUser = (): StoredUser | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(STORAGE_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const setStoredUser = (user: StoredUser) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

export const clearStoredUser = () => {
  localStorage.removeItem(STORAGE_KEY);
};
