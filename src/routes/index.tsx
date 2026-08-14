import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ServerCard from "@/components/ServerCard";
import StatsBlock from "@/components/StatsBlock";
import { GAME_MODES, SERVERS } from "@/lib/mock-data";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RUH PROJECT — лучшие игровые сервера" },
      {
        name: "description",
        content:
          "RUH PROJECT — 10 игровых режимов, привилегии, скинченджер, таблица лидеров и активная администрация. Подключайся и играй.",
      },
      { property: "og:title", content: "RUH PROJECT — лучшие игровые сервера" },
      {
        property: "og:description",
        content: "10 режимов, привилегии, скинченджер и лидерборд на серверах RUH PROJECT.",
      },
    ],
  }),
  component: Index,
});

const STATUS_LABEL: Record<string, { text: string; className: string }> = {
  online: { text: "Онлайн", className: "bg-green-500/15 text-green-400 border-green-500/40" },
  offline: { text: "Оффлайн", className: "bg-red-500/15 text-red-400 border-red-500/40" },
  restarting: { text: "Рестарт", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/40" },
};

interface ServerStatus {
  id?: string;
  name: string;
  map: string;
  players: number;
  maxPlayers: number;
  status: string;
  ip?: string;
}

function Index() {
  const [servers, setServers] = useState<ServerStatus[]>(SERVERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStatus = () => {
      apiFetch<ServerStatus[]>('/api/servers')
        .then(res => {
          if (isMounted && Array.isArray(res) && res.length > 0) {
            setServers(res);
          }
        })
        .catch(() => {
          // If servers endpoint fails, try single status or keep SERVERS fallback
          apiFetch<ServerStatus>('/api/server-status')
            .then(single => {
              if (isMounted && single) {
                setServers([
                  { ...single, ip: "79.143.20.204:27024" },
                  ...SERVERS.slice(1),
                ]);
              }
            })
            .catch(() => {});
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    };

    fetchStatus();
    // Auto-refresh live server status every 10 seconds
    const interval = setInterval(fetchStatus, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const totalPlayers = servers.reduce((acc, s) => acc + (s.players || 0), 0);
  const onlineServersCount = servers.filter((s) => s.status === "online").length || (servers.length > 0 ? 1 : 0);

  return (
    <div className="pt-20">
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#7c3aed] opacity-20 blur-[140px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-[#a855f7] opacity-10 blur-[120px]" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-24 text-center sm:px-6">
          <span className="animate-fade-in-down inline-flex items-center gap-2 rounded-full border border-purple-800 bg-[#111111] px-4 py-1.5 text-xs text-purple-300">
            <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
            {loading ? "Загрузка онлайна..." : `${onlineServersCount} сервер онлайн · ${totalPlayers} игрок(ов)`}
          </span>

          <h1 className="animate-fade-in-down mx-auto mt-8 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-gradient-brand">Добро пожаловать в RUH PROJECT</span>
          </h1>

          <p style={{ animationDelay: "150ms" }} className="animate-fade-in-up mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">Лучшие игровые сервера</p>

          <div style={{ animationDelay: "300ms" }} className="animate-fade-in-up mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/store"
              className="rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
            >
              Магазин
            </Link>
            <a
              href="#servers"
              className="rounded-xl border border-purple-800 bg-[#111111] px-8 py-3.5 text-sm font-semibold text-purple-300 transition-all duration-300 hover:scale-105 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
            >
              Играть
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Статистика проекта</h2>
        <div className="mt-10">
          <StatsBlock />
        </div>
      </section>

      <section id="servers" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Наши сервера</h2>

        <div className="mt-10 overflow-x-auto rounded-xl border border-purple-800 bg-[#1a1a1a]">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#111111] text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Сервер</th>
                <th className="px-5 py-3">Карта</th>
                <th className="px-5 py-3">Игроки</th>
                <th className="px-5 py-3">Статус</th>
                <th className="px-5 py-3 text-right">Подключиться</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 1 }).map((_, i) => (
                  <tr key={i} className="border-t border-purple-900/40">
                    <td colSpan={5} className="px-5 py-3">
                      <div className="h-6 w-full animate-pulse rounded bg-purple-900/20" />
                    </td>
                  </tr>
                ))
              ) : (
                servers.map((server, i) => {
                  const status = STATUS_LABEL[server.status] || STATUS_LABEL["offline"];
                  return (
                    <tr
                      key={i}
                      className="border-t border-purple-900/40 transition-all duration-300 hover:bg-[#111111]"
                    >
                      <td className="px-5 py-3 font-semibold text-foreground">{server.name}</td>
                      <td className="px-5 py-3 text-muted-foreground">{server.map}</td>
                      <td className="px-5 py-3 text-purple-300">
                        {server.players}/{server.maxPlayers}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${status?.className ?? ""}`}>
                          {status?.text ?? server.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <a
                          href={`steam://connect/${server.ip || "79.143.20.204:27024"}`}
                          className="inline-block rounded-lg border border-purple-800 bg-[#111111] px-3 py-1.5 text-xs font-semibold text-purple-300 transition-all duration-300 hover:scale-105 hover:border-purple-500 hover:bg-gradient-to-r hover:from-[#7c3aed] hover:to-[#a855f7] hover:text-primary-foreground"
                        >
                          Подключиться
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
