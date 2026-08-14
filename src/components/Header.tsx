import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSteamAuth } from "@/hooks/useSteamAuth";
import SteamLoginButton from "@/components/SteamLoginButton";
import UserHeaderMenu from "@/components/UserHeaderMenu";
import { apiFetch } from "@/lib/api";

const DISCORD_URL = "https://discord.gg/ruhproject";

const MAIN_LINKS = [
  { to: "/", label: "Главная" },
  { to: "/store", label: "Магазин" },
  { to: "/skinchanger", label: "Скинченджер" },
  { to: "/tickets", label: "Тикеты" },
] as const;

const OTHER_LINKS = [
  { to: "/rules", label: "Правила" },
  { to: "/leaderboard", label: "Лидеры" },
  { to: "/steamfinder", label: "Поиск игрока" },
  { to: "/tickets", label: "Заявки" },
  { to: "/punishment", label: "Блокировки" },
  { to: "/faq", label: "FAQ" },
] as const;

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.445.865-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.61 12.61 0 0 0-.617-1.25.077.077 0 0 0-.079-.036A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .079.009c.12.099.245.198.372.292a.077.077 0 0 1-.006.127c-.598.35-1.22.645-1.873.891a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028ZM8.02 15.331c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
    </svg>
  );
}

function HeaderContent() {
  const { user, isLoggedIn, isLoading, logout } = useSteamAuth();
  const [onlinePlayers, setOnlinePlayers] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    const fetchStatus = () => {
      apiFetch<{ players: number }>('/api/server-status')
        .then((res) => {
          if (isMounted && typeof res.players === 'number') {
            setOnlinePlayers(res.players);
          }
        })
        .catch(() => {});
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-purple-900/40 bg-black/50 backdrop-blur-md">
      <input type="checkbox" id="ruh-menu" className="peer hidden" />

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="text-xl font-extrabold tracking-tight sm:text-2xl">
          <span className="text-gradient-logo">RUH PROJECT</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {MAIN_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              activeProps={{ className: "text-purple-400" }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-[#1a1a1a] hover:text-purple-400"
            >
              {link.label}
            </Link>
          ))}

          <div className="group relative">
            <button
              type="button"
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 group-hover:bg-[#1a1a1a] group-hover:text-purple-400"
            >
              Прочее
              <span className="text-xs transition-transform duration-300 group-hover:rotate-180">▾</span>
            </button>
            <div className="invisible absolute left-0 top-full w-48 translate-y-2 rounded-xl border border-purple-800 bg-[#111111] p-2 opacity-0 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              {OTHER_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-300 hover:bg-[#1a1a1a] hover:text-purple-400"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer"
            className="ml-1 flex items-center gap-2 rounded-lg border border-[#5865F2]/60 bg-[#5865F2]/10 px-3 py-2 text-sm font-semibold text-[#8b93ff] transition-all duration-300 hover:scale-105 hover:bg-[#5865F2]/20 hover:shadow-[0_0_20px_rgba(88,101,242,0.45)]"
          >
            <DiscordIcon className="h-4 w-4" />
            Наш Discord
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-purple-900/60 bg-[#111111] px-3 py-1.5 sm:flex">
            <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
            <span className="text-xs font-medium text-muted-foreground">В игре: {onlinePlayers}</span>
          </div>

          {!isLoading && (
            <>
              {isLoggedIn && user ? (
                <UserHeaderMenu user={user} onLogout={logout} />
              ) : (
                <SteamLoginButton />
              )}
            </>
          )}

          <label
            htmlFor="ruh-menu"
            className="flex h-10 w-10 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-purple-900/60 bg-[#111111] lg:hidden"
            aria-label="Меню"
          >
            <span className="h-0.5 w-5 bg-purple-400" />
            <span className="h-0.5 w-5 bg-purple-400" />
            <span className="h-0.5 w-5 bg-purple-400" />
          </label>
        </div>
      </div>

      <div className="hidden border-t border-purple-900/40 bg-[#111111] peer-checked:block lg:peer-checked:hidden">
        <nav className="mx-auto grid max-w-7xl gap-1 px-4 py-4 sm:px-6">
          {[...MAIN_LINKS, ...OTHER_LINKS].map((link, i) => (
            <Link
              key={`${link.label}-${i}`}
              to={link.to}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-[#1a1a1a] hover:text-purple-400"
            >
              {link.label}
            </Link>
          ))}

          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-1 flex items-center gap-2 rounded-lg border border-[#5865F2]/60 bg-[#5865F2]/10 px-3 py-2.5 text-sm font-semibold text-[#8b93ff] transition-all duration-300 hover:bg-[#5865F2]/20"
          >
            <DiscordIcon className="h-4 w-4" />
            Наш Discord
          </a>
        </nav>
      </div>
    </header>
  );
}

export default HeaderContent;
