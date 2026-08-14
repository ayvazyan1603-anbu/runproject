import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useFaceitPlayer } from "@/hooks/useFaceitPlayer";
import FaceitLevelBadge from "@/components/FaceitLevelBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorBlock from "@/components/ErrorBlock";
import { parseSteamIdFromInput, getSteamPlayerSummary, getMockSteamUser } from "@/lib/steam-api";
import type { SteamUser } from "@/types";
import { STEAM_PERSONA_STATES } from "@/types";

export const Route = createFileRoute("/steamfinder")({
  head: () => ({
    meta: [
      { title: "Поиск игрока — RUH PROJECT" },
      { name: "description", content: "Найти игрока по SteamID64, Steam профилю или Faceit нику" },
    ],
  }),
  component: SteamFinderPage,
});

const COUNTRY_FLAGS: Record<string, string> = {
  ru: "🇷🇺", ua: "🇺🇦", kz: "🇰🇿", by: "🇧🇾", de: "🇩🇪",
  pl: "🇵🇱", fr: "🇫🇷", se: "🇸🇪", dk: "🇩🇰", fi: "🇫🇮",
};

function SteamFinderPage() {
  const [query, setQuery] = useState("");
  const [steamUser, setSteamUser] = useState<SteamUser | null>(null);
  const [steamLoading, setSteamLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const faceit = useFaceitPlayer();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setHasSearched(true);
    setSteamLoading(true);
    setSteamUser(null);

    try {
      const parsedSteamId = parseSteamIdFromInput(query);

      if (parsedSteamId) {
        // Search by SteamID
        const user = await getSteamPlayerSummary(parsedSteamId);
        setSteamUser(user ?? getMockSteamUser(parsedSteamId));
        await faceit.searchBySteamId(parsedSteamId);
      } else {
        // Search by Faceit nickname
        await faceit.searchByNickname(query);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setSteamLoading(false);
    }
  };

  return (
    <div className="pt-20">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            <span className="text-gradient-brand">Поиск игрока</span>
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Найдите статистику игрока по Steam или Faceit
          </p>

          <form onSubmit={handleSearch} className="mt-8 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-grow">
              <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SteamID64, ссылка на профиль Steam или Faceit ник"
                className="w-full rounded-xl border border-purple-800 bg-[#111111] py-3.5 pl-12 pr-5 text-foreground placeholder:text-muted-foreground transition-all duration-300 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              />
            </div>
            <button
              type="submit"
              disabled={steamLoading || faceit.isLoading}
              className="rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] disabled:opacity-50 disabled:hover:scale-100"
            >
              Найти
            </button>
          </form>
        </div>

        {hasSearched && (
          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Steam Block */}
            <div className="animate-fade-in-up rounded-xl border border-purple-800 bg-[#1a1a1a] p-6" style={{ animationDelay: "100ms" }}>
              <h3 className="mb-6 flex items-center gap-3 text-xl font-semibold text-foreground">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                  <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658a3.387 3.387 0 0 1 1.912-.59c.064 0 .127.003.19.008l2.861-4.142V8.91a4.528 4.528 0 0 1 4.524-4.524 4.528 4.528 0 0 1 4.524 4.524 4.528 4.528 0 0 1-4.524 4.524h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396a3.404 3.404 0 0 1-3.362-2.898L.309 15.245C1.468 20.21 5.894 24 11.979 24c6.627 0 12-5.373 12-12S18.606 0 11.979 0z" />
                </svg>
                Steam профиль
              </h3>

              {steamLoading ? (
                <LoadingSpinner text="Загрузка Steam данных..." />
              ) : steamUser ? (
                <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                  <img
                    src={steamUser.avatarfull}
                    alt={steamUser.personaname}
                    className="h-20 w-20 rounded-full border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                  />
                  <div className="flex flex-col items-center sm:items-start">
                    <a
                      href={steamUser.profileurl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xl font-bold text-foreground transition-colors hover:text-purple-400"
                    >
                      {steamUser.personaname}
                    </a>

                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          steamUser.personastate === 0
                            ? "bg-gray-500"
                            : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                        }`}
                      />
                      <span className={`text-sm ${STEAM_PERSONA_STATES[steamUser.personastate]?.color ?? "text-muted-foreground"}`}>
                        {STEAM_PERSONA_STATES[steamUser.personastate]?.label ?? "Неизвестно"}
                      </span>
                    </div>

                    <div className="mt-4 space-y-1">
                      <div className="font-mono text-xs text-muted-foreground">
                        SteamID64: {steamUser.steamid}
                      </div>
                      {steamUser.timecreated && (
                        <div className="text-sm text-muted-foreground">
                          Регистрация: {new Date(steamUser.timecreated * 1000).toLocaleDateString("ru-RU")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                  Steam аккаунт не найден
                </div>
              )}
            </div>

            {/* Faceit Block */}
            <div className="animate-fade-in-up rounded-xl border border-purple-800 bg-[#1a1a1a] p-6" style={{ animationDelay: "200ms" }}>
              <h3 className="mb-6 flex items-center gap-3 text-xl font-semibold text-faceit-orange">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                  <path d="M24 12c0-.23-.046-.432-.14-.607a1.054 1.054 0 0 0-.41-.424c-.183-.105-.41-.157-.682-.157H12.756V0c0 1.94 1.258 3.52 3.125 3.94l6.452 1.455c1.107.25 1.665.986 1.665 2.21L24 12zM0 12c0 .23.047.433.142.61.094.174.23.315.408.423.183.104.412.155.685.155h10.01v10.81c0-1.942-1.257-3.52-3.124-3.942L1.668 18.6C.56 18.35 0 17.615 0 16.39V12z" />
                </svg>
                Faceit профиль
              </h3>

              {faceit.isLoading ? (
                <LoadingSpinner text="Загрузка Faceit данных..." />
              ) : faceit.error ? (
                <ErrorBlock message={faceit.error} />
              ) : faceit.player ? (
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-foreground">{faceit.player.nickname}</span>
                      <span className="text-lg">{COUNTRY_FLAGS[faceit.player.country.toLowerCase()] ?? "🏳️"}</span>
                    </div>
                    <FaceitLevelBadge level={faceit.player.games?.cs2?.skill_level ?? 1} size="lg" showLabel={false} />
                  </div>

                  <div className="mt-3">
                    <span className="text-3xl font-bold text-purple-300">
                      {faceit.player.games?.cs2?.faceit_elo?.toLocaleString("ru-RU") ?? "—"}
                    </span>
                    <span className="ml-2 text-sm text-muted-foreground">ELO</span>
                  </div>

                  {faceit.stats && (
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-purple-900/40 bg-[#111111] p-3 text-center transition-colors hover:border-purple-800">
                        <div className="text-xs text-muted-foreground">Матчей</div>
                        <div className="text-xl font-semibold text-foreground">{faceit.stats.lifetime.Matches}</div>
                      </div>
                      <div className="rounded-lg border border-purple-900/40 bg-[#111111] p-3 text-center transition-colors hover:border-purple-800">
                        <div className="text-xs text-muted-foreground">Win%</div>
                        <div className="text-xl font-semibold text-green-400">{faceit.stats.lifetime["Win Rate %"]}%</div>
                      </div>
                      <div className="rounded-lg border border-purple-900/40 bg-[#111111] p-3 text-center transition-colors hover:border-purple-800">
                        <div className="text-xs text-muted-foreground">K/D средний</div>
                        <div className="text-xl font-semibold text-foreground">{faceit.stats.lifetime["Average K/D Ratio"]}</div>
                      </div>
                      <div className="rounded-lg border border-purple-900/40 bg-[#111111] p-3 text-center transition-colors hover:border-purple-800">
                        <div className="text-xs text-muted-foreground">Headshot%</div>
                        <div className="text-xl font-semibold text-foreground">{faceit.stats.lifetime["Average Headshots %"]}%</div>
                      </div>
                    </div>
                  )}

                  {faceit.matchHistory && faceit.matchHistory.items.length > 0 && (
                    <div className="mt-8">
                      <h4 className="mb-4 text-lg font-semibold text-foreground">Последние матчи</h4>
                      <div className="overflow-x-auto rounded-xl border border-purple-800">
                        <table className="w-full min-w-[500px] text-left text-sm">
                          <thead className="bg-[#111111] text-xs uppercase tracking-wide text-muted-foreground">
                            <tr>
                              <th className="px-4 py-3">Карта</th>
                              <th className="px-4 py-3">Результат</th>
                              <th className="px-4 py-3">K/D</th>
                              <th className="px-4 py-3">Дата</th>
                            </tr>
                          </thead>
                          <tbody>
                            {faceit.matchHistory.items.map((match) => (
                              <tr key={match.match_id} className="border-t border-purple-900/40 transition-colors hover:bg-[#111111]">
                                <td className="px-4 py-3 font-medium text-foreground">
                                  {match.map ?? "—"}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                    match.isWin
                                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                                  }`}>
                                    {match.isWin ? "Победа" : "Поражение"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-semibold text-foreground">
                                  {match.kd ?? "—"}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                  {match.finished_at
                                    ? new Date(match.finished_at * 1000).toLocaleDateString("ru-RU")
                                    : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                  Faceit аккаунт не найден
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
