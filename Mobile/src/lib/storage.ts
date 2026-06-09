// src/lib/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
};

export const storage = {
  getAccessToken: () => AsyncStorage.getItem(KEYS.ACCESS_TOKEN),
  getRefreshToken: () => AsyncStorage.getItem(KEYS.REFRESH_TOKEN),
  getUser: async () => {
    const raw = await AsyncStorage.getItem(KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  },
  setTokens: async (access: string, refresh: string) => {
    await AsyncStorage.multiSet([
      [KEYS.ACCESS_TOKEN, access],
      [KEYS.REFRESH_TOKEN, refresh],
    ]);
  },
  setUser: (user: object) => AsyncStorage.setItem(KEYS.USER, JSON.stringify(user)),
  clear: () => AsyncStorage.multiRemove([KEYS.ACCESS_TOKEN, KEYS.REFRESH_TOKEN, KEYS.USER]),
};
