import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface RankRow {
  steam: string
  name: string
  kills: number
  deaths: number
  shoots: number
  hits: number
  headshots: number
  assists: number
  round_win: number
  round_lose: number
  playtime: number
  lastconnect: number
  rank: number
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

export default function LeaderboardTable() {
  const [data, setData] = useState<RankRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = () => {
    setLoading(true);
    setError(false);
    apiFetch<RankRow[]>('/api/ranks')
      .then(res => {
        res.sort((a, b) => b.rank - a.rank);
        setData(res);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-8 text-center text-red-400">
        <p className="mb-4">Произошла ошибка при загрузке данных</p>
        <button
          onClick={fetchData}
          className="rounded-lg bg-red-500/20 px-4 py-2 text-sm hover:bg-red-500/30 transition-colors"
        >
          Повторить
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-purple-800 bg-[#1a1a1a]">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-[#111111] text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-5 py-3">#</th>
            <th className="px-5 py-3">Игрок</th>
            <th className="px-5 py-3">Убийства</th>
            <th className="px-5 py-3">Смерти</th>
            <th className="px-5 py-3">K/D</th>
            <th className="px-5 py-3">HS%</th>
            <th className="px-5 py-3">Часов</th>
            <th className="px-5 py-3">Ранг</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t border-purple-900/40">
                <td colSpan={8} className="px-5 py-3">
                  <div className="h-6 w-full animate-pulse rounded bg-purple-900/20" />
                </td>
              </tr>
            ))
          ) : (
            data.map((player, index) => {
              const pos = index + 1;
              const kd = player.deaths === 0 ? player.kills : player.kills / player.deaths;
              const hsPercent = player.kills === 0 ? 0 : (player.headshots / player.kills) * 100;
              const hours = Math.floor(player.playtime / 60);

              return (
                <tr
                  key={player.steam}
                  className={`border-t border-purple-900/40 transition-all duration-300 hover:bg-[#111111] ${RANK_STYLES[pos] ?? ""}`}
                >
                  <td className={`px-5 py-3 font-bold ${RANK_TEXT[pos] ?? "text-muted-foreground"}`}>
                    {pos}
                  </td>
                  <td className="px-5 py-3 font-semibold text-foreground">{player.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{player.kills.toLocaleString("ru-RU")}</td>
                  <td className="px-5 py-3 text-muted-foreground">{player.deaths.toLocaleString("ru-RU")}</td>
                  <td className="px-5 py-3 font-semibold text-foreground">{kd.toFixed(2)}</td>
                  <td className="px-5 py-3 text-muted-foreground">{hsPercent.toFixed(0)}%</td>
                  <td className="px-5 py-3 text-muted-foreground">{hours}</td>
                  <td className="px-5 py-3 text-purple-300">{player.rank.toLocaleString("ru-RU")}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
