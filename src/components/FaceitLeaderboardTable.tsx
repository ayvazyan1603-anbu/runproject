import { useState, useEffect } from "react";
import FaceitLevelBadge from "@/components/FaceitLevelBadge";
import ErrorBlock from "@/components/ErrorBlock";
import {
  getFaceitPlayerBySteamId,
  getFaceitPlayerStats,
  getMockFaceitLeaderboard,
} from "@/lib/faceit-api";
import type { FaceitPlayer, FaceitPlayerStats } from "@/types";

/**
 * Hardcoded SteamID64 list of project players.
 * Replace with real SteamIDs of your community members.
 */
const PROJECT_PLAYERS: string[] = [
  "76561198000000001",
  "76561198000000002",
  "76561198000000003",
  "76561198000000004",
  "76561198000000005",
];

interface LeaderboardEntry {
  rank: number;
  player: FaceitPlayer;
  stats: FaceitPlayerStats | null;
}

const RANK_STYLES: Record<number, string> = {
  1: "bg-yellow-500/10 border-l-2 border-l-yellow-400",
  2: "bg-slate-400/10 border-l-2 border-l-slate-300",
  3: "bg-amber-700/10 border-l-2 border-l-amber-600",
};

const RANK_TEXT: Record<number, string> = {
  1: "text-yellow-400",
  2: "text-slate-300",
  3: "text-amber-600",
};

const COUNTRY_FLAGS: Record<string, string> = {
  ru: "🇷🇺", ua: "🇺🇦", kz: "🇰🇿", by: "🇧🇾", de: "🇩🇪",
  pl: "🇵🇱", fr: "🇫🇷", se: "🇸🇪", dk: "🇩🇰", fi: "🇫🇮",
  tr: "🇹🇷", us: "🇺🇸", gb: "🇬🇧", nl: "🇳🇱", cz: "🇨🇿",
};

/** Skeleton loader — 5 pulsing rows */
function SkeletonTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-purple-800 bg-[#1a1a1a]">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead className="bg-[#111111] text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-5 py-3">#</th>
            <th className="px-5 py-3">Игрок</th>
            <th className="px-5 py-3">Уровень</th>
            <th className="px-5 py-3">ELO</th>
            <th className="px-5 py-3">Страна</th>
            <th className="px-5 py-3">Матчей</th>
            <th className="px-5 py-3">Win%</th>
            <th className="px-5 py-3">K/D</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }, (_, i) => (
            <tr key={i} className="border-t border-purple-900/40">
              {Array.from({ length: 8 }, (_, j) => (
                <td key={j} className="px-5 py-4">
                  <div
                    className="h-4 animate-pulse rounded bg-purple-900/20"
                    style={{ width: j === 1 ? "140px" : "60px" }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function FaceitLeaderboardTable() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try real Faceit API for each project player
      const results = await Promise.allSettled(
        PROJECT_PLAYERS.map(async (steamId) => {
          const player = await getFaceitPlayerBySteamId(steamId);
          if (!player) return null;

          const stats = await getFaceitPlayerStats(player.player_id);
          return { player, stats };
        }),
      );

      const validEntries = results
        .map((r) => (r.status === "fulfilled" ? r.value : null))
        .filter((entry): entry is { player: FaceitPlayer; stats: FaceitPlayerStats | null } => entry !== null);

      if (validEntries.length > 0) {
        // Sort by ELO descending
        validEntries.sort(
          (a, b) =>
            (b.player.games.cs2?.faceit_elo ?? 0) - (a.player.games.cs2?.faceit_elo ?? 0),
        );

        setEntries(
          validEntries.map((e, i) => ({
            rank: i + 1,
            player: e.player,
            stats: e.stats,
          })),
        );
      } else {
        // Fallback to mock data if no real data
        const mockData = getMockFaceitLeaderboard();
        setEntries(mockData.map((e) => ({ ...e, stats: e.stats as FaceitPlayerStats | null })));
      }
    } catch {
      // On complete failure, try mock data
      try {
        const mockData = getMockFaceitLeaderboard();
        setEntries(mockData.map((e) => ({ ...e, stats: e.stats as FaceitPlayerStats | null })));
      } catch {
        setError("Не удалось загрузить данные Faceit");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadLeaderboard();
  }, []);

  if (isLoading) {
    return <SkeletonTable />;
  }

  if (error) {
    return <ErrorBlock message={error} onRetry={() => void loadLeaderboard()} />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-purple-800 bg-[#1a1a1a]">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead className="bg-[#111111] text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-5 py-3">#</th>
            <th className="px-5 py-3">Игрок</th>
            <th className="px-5 py-3">Уровень</th>
            <th className="px-5 py-3">ELO</th>
            <th className="px-5 py-3">Страна</th>
            <th className="px-5 py-3">Матчей</th>
            <th className="px-5 py-3">Win%</th>
            <th className="px-5 py-3">K/D</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.player.player_id}
              className={`border-t border-purple-900/40 transition-all duration-300 hover:bg-[#111111] ${RANK_STYLES[entry.rank] ?? ""}`}
            >
              <td className={`px-5 py-3 font-bold ${RANK_TEXT[entry.rank] ?? "text-muted-foreground"}`}>
                {entry.rank}
              </td>
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <img
                    src={entry.player.avatar}
                    alt={entry.player.nickname}
                    className="h-8 w-8 rounded-full border border-purple-800"
                  />
                  <a
                    href={entry.player.faceit_url.replace("{lang}", "en")}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-foreground transition-colors hover:text-purple-400"
                  >
                    {entry.player.nickname}
                  </a>
                </div>
              </td>
              <td className="px-5 py-3">
                <FaceitLevelBadge
                  level={entry.player.games.cs2?.skill_level ?? 1}
                  size="sm"
                  showLabel={false}
                />
              </td>
              <td className="px-5 py-3 font-semibold text-purple-300">
                {entry.player.games.cs2?.faceit_elo?.toLocaleString("ru-RU") ?? "—"}
              </td>
              <td className="px-5 py-3 text-lg">
                {COUNTRY_FLAGS[entry.player.country] ?? "🏳️"}
              </td>
              <td className="px-5 py-3 text-muted-foreground">
                {entry.stats
                  ? Number(entry.stats.lifetime.Matches).toLocaleString("ru-RU")
                  : "—"}
              </td>
              <td className="px-5 py-3 font-semibold text-green-400">
                {entry.stats
                  ? `${entry.stats.lifetime["Win Rate %"]}%`
                  : "—"}
              </td>
              <td className="px-5 py-3 font-semibold text-foreground">
                {entry.stats
                  ? entry.stats.lifetime["Average K/D Ratio"]
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
