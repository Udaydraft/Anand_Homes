import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Platform-aware secure token storage.
 * Uses hardware-backed keychain / keystore on iOS/Android via Expo SecureStore.
 */
export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        const storage = (globalThis as any)?.localStorage;
        if (storage) {
          storage.setItem(key, value);
        }
      } else {
        await SecureStore.setItemAsync(key, value, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED,
        });
      }
    } catch (error) {
      console.warn(`Error storing ${key} securely:`, error);
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        const storage = (globalThis as any)?.localStorage;
        if (storage) {
          return storage.getItem(key);
        }
        return null;
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.warn(`Error reading ${key} securely:`, error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        const storage = (globalThis as any)?.localStorage;
        if (storage) {
          storage.removeItem(key);
        }
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.warn(`Error deleting ${key} securely:`, error);
    }
  },
};
