import { FAQ_ITEMS } from "@/lib/mock-data";

export default function FaqAccordion() {
  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item) => (
        <details
          key={item.id}
          className="group rounded-xl border border-purple-800 bg-[#1a1a1a] transition-all duration-300 open:border-purple-500 open:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:border-purple-500"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
            {item.question}
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-purple-800 text-purple-400 transition-all duration-300 group-open:rotate-180 group-open:border-purple-500">
              <span className="group-open:hidden">+</span>
              <span className="hidden group-open:inline">−</span>
            </span>
          </summary>
          <div className="border-t border-purple-900/40 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
