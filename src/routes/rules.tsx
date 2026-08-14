import { createFileRoute } from "@tanstack/react-router";
import { RULES_SECTIONS } from "@/lib/mock-data";

export const Route = createFileRoute("/rules")({
  head: () => ({
    meta: [
      { title: "Правила — RUH PROJECT" },
      {
        name: "description",
        content: "Правила серверов RUH PROJECT: общие положения, чат, игровой процесс, голосовой чат, администрация и покупки.",
      },
      { property: "og:title", content: "Правила — RUH PROJECT" },
      { property: "og:description", content: "Полный свод правил игроков и администрации RUH PROJECT." },
    ],
  }),
  component: RulesPage,
});

function RulesPage() {
  return (
    <div className="pt-20">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          <span className="text-gradient-brand">Правила — RUH PROJECT</span>
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Соблюдение правил обязательно для всех игроков и администрации проекта.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-4">
          <aside className="h-fit rounded-xl border border-purple-800 bg-[#1a1a1a] p-4 lg:sticky lg:top-24">
            <h2 className="px-2 text-xs uppercase tracking-wide text-muted-foreground">Разделы</h2>
            <nav className="mt-3 space-y-1">
              {RULES_SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-300 hover:bg-[#111111] hover:text-purple-400"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          <div className="space-y-6 lg:col-span-3">
            {RULES_SECTIONS.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-28 rounded-xl border border-purple-800 bg-[#1a1a1a] p-6 transition-all duration-300 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
              >
                <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
                <ol className="mt-4 space-y-3">
                  {section.items.map((item, i) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                      <span className="shrink-0 font-semibold text-purple-400">
                        {section.title.split(".")[0]}.{i + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
