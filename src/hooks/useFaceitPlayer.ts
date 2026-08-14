import { useState, useEffect, useCallback } from "react";
import type { FaceitPlayer, FaceitPlayerStats, FaceitMatchHistory } from "@/types";
import {
  getFaceitPlayerBySteamId,
  getFaceitPlayerByNickname,
  getFaceitMatchHistory,
  getFaceitPlayerStats,
  getMockFaceitPlayer,
  getMockMatchHistory,
  getMockPlayerStats,
} from "@/lib/faceit-api";

export interface UseFaceitPlayerReturn {
  player: FaceitPlayer | null;
  stats: FaceitPlayerStats | null;
  matchHistory: FaceitMatchHistory | null;
  isLoading: boolean;
  error: string | null;
  notFound: boolean;
  searchBySteamId: (steamId: string) => Promise<void>;
  searchByNickname: (nickname: string) => Promise<void>;
}

export function useFaceitPlayer(): UseFaceitPlayerReturn {
  const [player, setPlayer] = useState<FaceitPlayer | null>(null);
  const [stats, setStats] = useState<FaceitPlayerStats | null>(null);
  const [matchHistory, setMatchHistory] = useState<FaceitMatchHistory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const loadPlayerDetails = useCallback(async (foundPlayer: FaceitPlayer) => {
    setPlayer(foundPlayer);
    setNotFound(false);

    // Load stats and match history
    try {
      const [playerStats, history] = await Promise.all([
        getFaceitPlayerStats(foundPlayer.player_id),
        getFaceitMatchHistory(foundPlayer.player_id, 20),
      ]);

      setStats(playerStats ?? getMockPlayerStats());
      setMatchHistory(history ?? getMockMatchHistory());
    } catch {
      setStats(getMockPlayerStats());
      setMatchHistory(getMockMatchHistory());
    }
  }, []);

  const searchBySteamId = useCallback(
    async (steamId: string) => {
      setIsLoading(true);
      setError(null);
      setNotFound(false);
      setPlayer(null);
      setStats(null);
      setMatchHistory(null);

      try {
        const result = await getFaceitPlayerBySteamId(steamId);
        if (result) {
          await loadPlayerDetails(result);
        } else {
          // Use mock data if API not configured
          const mock = getMockFaceitPlayer(steamId);
          await loadPlayerDetails(mock);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Не удалось загрузить данные Faceit";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [loadPlayerDetails],
  );

  const searchByNickname = useCallback(
    async (nickname: string) => {
      setIsLoading(true);
      setError(null);
      setNotFound(false);
      setPlayer(null);
      setStats(null);
      setMatchHistory(null);

      try {
        const result = await getFaceitPlayerByNickname(nickname);
        if (result) {
          await loadPlayerDetails(result);
        } else {
          // Use mock data if API not configured
          const mock = getMockFaceitPlayer();
          mock.nickname = nickname;
          await loadPlayerDetails(mock);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Не удалось загрузить данные Faceit";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [loadPlayerDetails],
  );

  return {
    player,
    stats,
    matchHistory,
    isLoading,
    error,
    notFound,
    searchBySteamId,
    searchByNickname,
  };
}

/**
 * Auto-search Faceit by Steam ID on mount
 */
export function useFaceitBySteamId(steamId: string | null) {
  const faceit = useFaceitPlayer();

  useEffect(() => {
    if (steamId) {
      void faceit.searchBySteamId(steamId);
    }
    // Only run on steamId change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steamId]);

  return faceit;
}
