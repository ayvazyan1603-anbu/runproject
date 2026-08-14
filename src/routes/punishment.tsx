import { createFileRoute } from "@tanstack/react-router";
import PunishmentTable from "@/components/PunishmentTable";
import { PUNISHMENT_FILTERS } from "@/lib/mock-data";

export const Route = createFileRoute("/punishment")({
  head: () => ({
    meta: [
      { title: "Блокировки — RUH PROJECT" },
      {
        name: "description",
        content: "Список блокировок на серверах RUH PROJECT: баны, муты и кики с причинами, сроками и администраторами.",
      },
      { property: "og:title", content: "Блокировки — RUH PROJECT" },
      { property: "og:description", content: "Актуальные баны, муты и кики на серверах RUH PROJECT." },
    ],
  }),
  component: PunishmentPage,
});

function PunishmentPage() {
  return (
    <div className="pt-20">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          <span className="text-gradient-brand">Блокировки — RUH PROJECT</span>
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Все наказания фиксируются автоматически. Апелляция подаётся через раздел «Тикеты».
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {PUNISHMENT_FILTERS.map((filter, i) => (
            <button
              key={filter}
              type="button"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                i === 0
                  ? "bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-primary-foreground"
                  : "border border-purple-800 bg-[#111111] text-muted-foreground hover:border-purple-500 hover:text-purple-400"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="mt-8">
          <PunishmentTable />
        </div>
      </div>
    </div>
  );
}
