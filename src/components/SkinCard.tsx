import type { Skin } from "@/types";

export default function SkinCard({ skin }: { skin: Skin }) {
  return (
    <div className="group rounded-xl border border-purple-800 bg-[#1a1a1a] p-3 transition-all duration-300 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]">
      <div className="relative h-32 overflow-hidden rounded-lg bg-[#2a1a4a]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(168,85,247,0.5),transparent_60%)]" />
        <span className="absolute right-2 top-2 rounded-full bg-[#0a0a0a]/70 px-2 py-0.5 text-[10px] text-purple-300">
          {skin.rarity}
        </span>
      </div>

      <h3 className="mt-3 text-sm font-semibold text-foreground">{skin.name}</h3>

      <button
        type="button"
        className="mt-3 w-full rounded-lg border border-purple-800 bg-[#111111] px-3 py-1.5 text-xs font-semibold text-purple-300 transition-all duration-300 hover:border-purple-500 hover:bg-gradient-to-r hover:from-[#7c3aed] hover:to-[#a855f7] hover:text-primary-foreground"
      >
        Выбрать
      </button>
    </div>
  );
}
