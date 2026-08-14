import { Link } from "@tanstack/react-router";
import type { SteamUser } from "@/types";

export default function UserHeaderMenu({
  user,
  onLogout,
}: {
  user: SteamUser;
  onLogout: () => void;
}) {
  return (
    <div className="group relative">
      <Link
        to="/profile"
        className="flex items-center gap-2 rounded-lg border border-purple-900/60 bg-[#111111] px-3 py-1.5 transition-all duration-300 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
      >
        <img
          src={user.avatarmedium || user.avatar}
          alt={user.personaname}
          className="h-7 w-7 rounded-full"
        />
        <span className="hidden text-sm font-semibold text-foreground sm:inline">
          {user.personaname}
        </span>
      </Link>

      <div className="invisible absolute right-0 top-full z-50 w-44 translate-y-2 rounded-xl border border-purple-800 bg-[#111111] p-2 opacity-0 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <Link
          to="/profile"
          className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-300 hover:bg-[#1a1a1a] hover:text-purple-400"
        >
          👤 Профиль
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-all duration-300 hover:bg-red-500/10 hover:text-red-400"
        >
          🚪 Выйти
        </button>
      </div>
    </div>
  );
}
