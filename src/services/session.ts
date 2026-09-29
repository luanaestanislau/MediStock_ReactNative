import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { UserProfile } from '../types/ui';

const TOKEN_KEY = 'medistock.token';
const USER_KEY = 'medistock.user';

export interface StoredSession {
  token: string;
  user: UserProfile;
}

const isWeb = Platform.OS === 'web';
interface WebStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
const webStorage = (globalThis as unknown as { localStorage?: WebStorage }).localStorage;

async function setItem(key: string, value: string) {
  if (isWeb) return webStorage?.setItem(key, value);
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (isWeb) return webStorage?.getItem(key) ?? null;
  return SecureStore.getItemAsync(key);
}

async function removeItem(key: string) {
  if (isWeb) return webStorage?.removeItem(key);
  await SecureStore.deleteItemAsync(key);
}

export async function saveSession(session: StoredSession): Promise<void> {
  try {
    await setItem(TOKEN_KEY, session.token);
    await setItem(USER_KEY, JSON.stringify(session.user));
  } catch (err) {
    console.warn('Não foi possível salvar a sessão:', err);
  }
}

export async function loadSession(): Promise<StoredSession | null> {
  try {
    const [token, user] = await Promise.all([getItem(TOKEN_KEY), getItem(USER_KEY)]);
    if (!token || !user) return null;
    return { token, user: JSON.parse(user) as UserProfile };
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  try {
    await Promise.all([removeItem(TOKEN_KEY), removeItem(USER_KEY)]);
  } catch (err) {
    console.warn('Não foi possível limpar a sessão:', err);
  }
}
