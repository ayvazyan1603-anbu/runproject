import { useState, useEffect, useCallback } from "react";
import type { SteamUser } from "@/types";
import { buildSteamLoginUrl, getSteamPlayerSummary, getMockSteamUser } from "@/lib/steam-api";

const STORAGE_KEY = "ruh_steam_user";

export interface UseSteamAuthReturn {
  user: SteamUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  setSteamUser: (user: SteamUser) => void;
  loadUserBySteamId: (steamId: string) => Promise<void>;
}

function readStoredUser(): SteamUser | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as SteamUser;
  } catch {
    return null;
  }
}

const STEAMID_KEY = "ruh_steam_id";

function storeUser(user: SteamUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  localStorage.setItem(STEAMID_KEY, user.steamid);
}

function clearUser(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STEAMID_KEY);
}

/** Check if a stored profile looks like mock data that should be refreshed */
function isMockProfile(user: SteamUser): boolean {
  return /^Player_\d+$/.test(user.personaname);
}

export function useSteamAuth(): UseSteamAuthReturn {
  const [user, setUser] = useState<SteamUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount; if it looks like mock data, try to refresh
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const stored = readStoredUser();
      if (!stored) {
        setIsLoading(false);
        return;
      }

      // Show cached data immediately so UI isn't blank
      setUser(stored);

      // If the profile looks like a mock, try to fetch real data in the background
      if (isMockProfile(stored)) {
        try {
          const realUser = await getSteamPlayerSummary(stored.steamid);
          if (!cancelled && realUser) {
            storeUser(realUser);
            setUser(realUser);
          }
        } catch {
          // Keep the mock data — it's better than nothing
        }
      }

      if (!cancelled) setIsLoading(false);
    }

    void init();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(() => {
    const url = buildSteamLoginUrl();
    window.location.href = url;
  }, []);

  const logout = useCallback(() => {
    clearUser();
    setUser(null);
  }, []);

  const setSteamUser = useCallback((newUser: SteamUser) => {
    storeUser(newUser);
    setUser(newUser);
  }, []);

  const loadUserBySteamId = useCallback(async (steamId: string) => {
    setIsLoading(true);
    try {
      // Try real API / public XML first
      const realUser = await getSteamPlayerSummary(steamId);
      if (realUser) {
        storeUser(realUser);
        setUser(realUser);
      } else {
        // Fallback to mock
        const mockUser = getMockSteamUser(steamId);
        storeUser(mockUser);
        setUser(mockUser);
      }
    } catch {
      // Fallback to mock on error
      const mockUser = getMockSteamUser(steamId);
      storeUser(mockUser);
      setUser(mockUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoggedIn: user !== null,
    isLoading,
    login,
    logout,
    setSteamUser,
    loadUserBySteamId,
  };
}
