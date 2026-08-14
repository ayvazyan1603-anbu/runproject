import type { GameMode } from "@/types";

export default function ServerCard({ mode, index = 0 }: { mode: GameMode; index?: number }) {
  return (
    <div
      style={{ animationDelay: `${index * 70}ms` }}
      className="animate-fade-in-up group flex flex-col rounded-xl border border-purple-800 bg-[#1a1a1a] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-bold text-foreground">{mode.name}</h3>
        <span className="rounded-full border border-purple-800 bg-[#111111] px-2 py-0.5 text-[10px] uppercase tracking-wide text-purple-400">
          {mode.tag}
        </span>
      </div>

      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{mode.description}</p>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        В игре: {mode.players}
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-lg border border-purple-800 bg-[#111111] px-3 py-2 text-sm font-semibold text-purple-300 transition-all duration-300 hover:scale-105 hover:border-purple-500 hover:bg-gradient-to-r hover:from-[#7c3aed] hover:to-[#a855f7] hover:text-primary-foreground"
      >
        Быстрая игра
      </button>
    </div>
  );
}
