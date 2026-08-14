import { Link } from "@tanstack/react-router";

const DISCORD_URL = "https://discord.gg/W4uWbN6hK";
const TIKTOK_URL = "https://www.tiktok.com/@kesha_media?_r=1&_t=ZS-98liHG5GTMm";

export default function Footer() {
  return (
    <footer className="border-t border-purple-900/40 bg-[#111111]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-10 sm:px-6 md:flex-row">
        <Link to="/" className="text-lg font-extrabold tracking-tight">
          <span className="text-gradient-logo">RUH PROJECT</span>
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <Link to="/store" className="transition-colors duration-300 hover:text-purple-400">
            Магазин
          </Link>
          <Link to="/rules" className="transition-colors duration-300 hover:text-purple-400">
            Правила
          </Link>
          <Link to="/faq" className="transition-colors duration-300 hover:text-purple-400">
            FAQ
          </Link>
          <Link to="/tickets" className="transition-colors duration-300 hover:text-purple-400">
            Тикеты
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Discord RUH PROJECT"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-purple-900/60 bg-[#1a1a1a] text-muted-foreground transition-all duration-300 hover:scale-105 hover:border-[#5865F2] hover:text-[#8b93ff] hover:shadow-[0_0_20px_rgba(88,101,242,0.45)]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.445.865-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.61 12.61 0 0 0-.617-1.25.077.077 0 0 0-.079-.036A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .079.009c.12.099.245.198.372.292a.077.077 0 0 1-.006.127c-.598.35-1.22.645-1.873.891a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028ZM8.02 15.331c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
            </svg>
          </a>

          <a
            href={TIKTOK_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="TikTok RUH PROJECT"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-purple-900/60 bg-[#1a1a1a] text-muted-foreground transition-all duration-300 hover:scale-105 hover:border-purple-500 hover:text-purple-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path d="M16.6 5.82a4.28 4.28 0 0 1-1.04-2.82h-3.1v12.4a2.6 2.6 0 1 1-1.84-2.49V9.75a5.7 5.7 0 1 0 4.94 5.65V9.05a7.3 7.3 0 0 0 4.28 1.37V7.32a4.29 4.29 0 0 1-3.24-1.5Z" />
            </svg>
          </a>
        </div>

        <p className="text-xs text-muted-foreground">© 2026 RUH PROJECT</p>
      </div>
    </footer>
  );
}
