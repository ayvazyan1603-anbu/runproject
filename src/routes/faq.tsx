import { createFileRoute } from "@tanstack/react-router";
import FaqAccordion from "@/components/FaqAccordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — RUH PROJECT" },
      {
        name: "description",
        content: "Частые вопросы игроков RUH PROJECT: подключение к серверам, покупка привилегий, скинченджер и апелляции.",
      },
      { property: "og:title", content: "FAQ — RUH PROJECT" },
      { property: "og:description", content: "Ответы на частые вопросы о серверах и привилегиях RUH PROJECT." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <div className="pt-20">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          <span className="text-gradient-brand">FAQ — RUH PROJECT</span>
        </h1>
        <p className="mt-4 text-muted-foreground">Не нашли ответ? Создайте тикет — администрация поможет.</p>

        <div className="mt-10">
          <FaqAccordion />
        </div>
      </div>
    </div>
  );
}
