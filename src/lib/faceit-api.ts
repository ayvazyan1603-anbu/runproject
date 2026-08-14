import type { FaceitPlayer, FaceitMatchHistory, FaceitPlayerStats } from "@/types";

const FACEIT_API_KEY = import.meta.env["VITE_FACEIT_API_KEY"] as string | undefined;
const FACEIT_BASE = "https://open.faceit.com/data/v4";

function getFaceitHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${FACEIT_API_KEY ?? ""}`,
    Accept: "application/json",
  };
}

function isApiKeyConfigured(): boolean {
  return Boolean(FACEIT_API_KEY) && FACEIT_API_KEY !== "YOUR_FACEIT_API_KEY";
}

/**
 * Search for a Faceit player by Steam ID (game_player_id for CS2)
 */
export async function getFaceitPlayerBySteamId(steamId: string): Promise<FaceitPlayer | null> {
  if (!isApiKeyConfigured()) return null;

  try {
    const url = `${FACEIT_BASE}/players?game=cs2&game_player_id=${steamId}`;
    const response = await fetch(url, { headers: getFaceitHeaders() });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Faceit API error: ${response.status.toString()}`);
    return (await response.json()) as FaceitPlayer;
  } catch (error) {
    console.error("Failed to fetch Faceit player by Steam ID:", error);
    return null;
  }
}

/**
 * Search for a Faceit player by nickname
 */
export async function getFaceitPlayerByNickname(nickname: string): Promise<FaceitPlayer | null> {
  if (!isApiKeyConfigured()) return null;

  try {
    const url = `${FACEIT_BASE}/players?nickname=${encodeURIComponent(nickname)}`;
    const response = await fetch(url, { headers: getFaceitHeaders() });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Faceit API error: ${response.status.toString()}`);
    return (await response.json()) as FaceitPlayer;
  } catch (error) {
    console.error("Failed to fetch Faceit player by nickname:", error);
    return null;
  }
}

/**
 * Get Faceit player match history for CS2
 */
export async function getFaceitMatchHistory(
  playerId: string,
  limit = 20,
): Promise<FaceitMatchHistory | null> {
  if (!isApiKeyConfigured()) return null;

  try {
    const url = `${FACEIT_BASE}/players/${playerId}/history?game=cs2&offset=0&limit=${limit.toString()}`;
    const response = await fetch(url, { headers: getFaceitHeaders() });
    if (!response.ok) throw new Error(`Faceit API error: ${response.status.toString()}`);
    return (await response.json()) as FaceitMatchHistory;
  } catch (error) {
    console.error("Failed to fetch Faceit match history:", error);
    return null;
  }
}

/**
 * Get Faceit player stats for CS2
 */
export async function getFaceitPlayerStats(playerId: string): Promise<FaceitPlayerStats | null> {
  if (!isApiKeyConfigured()) return null;

  try {
    const url = `${FACEIT_BASE}/players/${playerId}/stats/cs2`;
    const response = await fetch(url, { headers: getFaceitHeaders() });
    if (!response.ok) throw new Error(`Faceit API error: ${response.status.toString()}`);
    return (await response.json()) as FaceitPlayerStats;
  } catch (error) {
    console.error("Failed to fetch Faceit player stats:", error);
    return null;
  }
}

/**
 * Mock Faceit player for development
 */
export function getMockFaceitPlayer(steamId?: string): FaceitPlayer {
  return {
    player_id: "mock-faceit-id-001",
    nickname: "RUH_Pro",
    avatar: "https://distribution.faceit-cdn.net/images/compress/player-avatar.png",
    country: "ru",
    cover_image: "",
    games: {
      cs2: {
        faceit_elo: 2847,
        skill_level: 10,
        region: "EU",
        game_player_id: steamId ?? "76561198012345678",
      },
    },
    faceit_url: "https://www.faceit.com/en/players/RUH_Pro",
  };
}

/**
 * Mock match history for development
 */
export function getMockMatchHistory(): FaceitMatchHistory {
  const maps = ["de_mirage", "de_inferno", "de_dust2", "de_nuke", "de_anubis", "de_ancient", "de_vertigo"];
  const now = Date.now();

  return {
    items: Array.from({ length: 20 }, (_, i) => ({
      match_id: `mock-match-${(i + 1).toString()}`,
      game_id: "cs2",
      started_at: Math.floor((now - (i + 1) * 3600000) / 1000),
      finished_at: Math.floor((now - i * 3600000) / 1000),
      playing_players: [],
      results: {
        winner: i % 3 === 0 ? "faction2" : "faction1",
        score: {
          faction1: i % 3 === 0 ? 12 : 16,
          faction2: i % 3 === 0 ? 16 : Math.floor(Math.random() * 14),
        },
      },
      teams: {
        faction1: {
          team_id: "team1",
          nickname: "Team Alpha",
          avatar: "",
          players: [{ player_id: "mock-faceit-id-001", nickname: "RUH_Pro", avatar: "" }],
        },
        faction2: {
          team_id: "team2",
          nickname: "Team Beta",
          avatar: "",
          players: [],
        },
      },
      map: maps[i % maps.length],
      playerTeam: "faction1" as const,
      isWin: i % 3 !== 0,
      kd: `${(0.8 + Math.random() * 1.8).toFixed(2)}`,
    })),
    start: 0,
    end: 20,
  };
}

/**
 * Mock player stats for development
 */
export function getMockPlayerStats(): FaceitPlayerStats {
  return {
    player_id: "mock-faceit-id-001",
    game_id: "cs2",
    lifetime: {
      "Average K/D Ratio": "1.34",
      "Win Rate %": "58",
      Matches: "1247",
      Wins: "723",
      "Total Headshots %": "52",
      "Average Headshots %": "48",
      "Longest Win Streak": "14",
      "Current Win Streak": "3",
    },
    segments: [],
  };
}

/**
 * Mock Faceit leaderboard entries for development
 */
export function getMockFaceitLeaderboard(): Array<{
  rank: number;
  player: FaceitPlayer;
  stats: FaceitPlayerStats;
}> {
  const names = [
    "s1mple_fan", "NaVi_Hope", "donk_style", "zywoo_ruh",
    "m0nesy_clone", "ax1le_enjoyer", "b1t_warrior", "headhunter",
    "awp_beast", "ropz_admirer",
  ];
  const countries = ["ru", "ua", "kz", "by", "de", "pl", "fr", "se", "dk", "fi"];

  return names.map((name, i) => ({
    rank: i + 1,
    player: {
      player_id: `mock-id-${(i + 1).toString()}`,
      nickname: name,
      avatar: "https://distribution.faceit-cdn.net/images/compress/player-avatar.png",
      country: countries[i] ?? "ru",
      cover_image: "",
      games: {
        cs2: {
          faceit_elo: 3200 - i * 120,
          skill_level: Math.max(1, 10 - Math.floor(i / 3)),
          region: "EU",
          game_player_id: `7656119801234567${i.toString()}`,
        },
      },
      faceit_url: `https://www.faceit.com/en/players/${name}`,
    },
    stats: {
      player_id: `mock-id-${(i + 1).toString()}`,
      game_id: "cs2",
      lifetime: {
        "Average K/D Ratio": (1.8 - i * 0.08).toFixed(2),
        "Win Rate %": (68 - i * 2).toString(),
        Matches: (2000 - i * 100).toString(),
        Wins: (1360 - i * 80).toString(),
        "Total Headshots %": (55 - i).toString(),
        "Average Headshots %": (50 - i).toString(),
        "Longest Win Streak": (18 - i).toString(),
        "Current Win Streak": Math.max(0, 5 - i).toString(),
      },
      segments: [],
    },
  }));
}
