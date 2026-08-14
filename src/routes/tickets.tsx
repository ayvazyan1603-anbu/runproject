import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { TICKET_CATEGORIES } from "@/lib/mock-data";
import type { TicketStatus } from "@/types";
import { useSteamAuth } from "@/hooks/useSteamAuth";
import { apiFetch, apiPost } from "@/lib/api";
import SteamLoginButton from "@/components/SteamLoginButton";
import LoadingSpinner from "@/components/LoadingSpinner";

export const Route = createFileRoute("/tickets")({
  head: () => ({
    meta: [
      { title: "Тикеты — RUH PROJECT" },
      {
        name: "description",
        content: "Создайте обращение в поддержку RUH PROJECT и отслеживайте статус своих тикетов и заявок.",
      },
      { property: "og:title", content: "Тикеты — RUH PROJECT" },
      { property: "og:description", content: "Обращения в поддержку и заявки игроков RUH PROJECT." },
    ],
  }),
  component: TicketsPage,
});

interface Ticket {
  id: number;
  subject: string;
  status: TicketStatus;
  created_at: string;
}

const STATUS: Record<TicketStatus, { label: string; className: string }> = {
  open: { label: "Открыт", className: "bg-green-500/15 text-green-400 border-green-500/40" },
  pending: { label: "В работе", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/40" },
  closed: { label: "Закрыт", className: "bg-neutral-500/15 text-neutral-300 border-neutral-500/40" },
};

const inputClass =
  "w-full rounded-lg border border-purple-800 bg-[#111111] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-300 focus:border-purple-500 focus:outline-none focus:shadow-[0_0_20px_rgba(168,85,247,0.3)]";

function TicketsPage() {
  const { user, isLoading: isAuthLoading } = useSteamAuth();
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState(TICKET_CATEGORIES[0]);
  const [message, setMessage] = useState("");

  const loadTickets = async () => {
    if (!user?.steamid) return;
    try {
      const data = await apiFetch<Ticket[]>(`/api/tickets/${user.steamid}`);
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      if (user) {
        loadTickets();
      } else {
        setIsLoading(false);
      }
    }
  }, [user, isAuthLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.steamid || !subject.trim() || !message.trim()) return;
    
    setIsSubmitting(true);
    try {
      await apiPost('/api/tickets', {
        steamid: user.steamid,
        player_name: user.personaname,
        subject,
        category,
        message
      });
      toast.success('Тикет создан!');
      setSubject("");
      setMessage("");
      setCategory(TICKET_CATEGORIES[0]);
      await loadTickets();
    } catch (err) {
      toast.error('Ошибка при создании тикета');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || (isLoading && user)) {
    return <div className="pt-20 flex justify-center py-20"><LoadingSpinner /></div>;
  }

  if (!user) {
    return (
      <div className="pt-20 mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center justify-center rounded-xl border border-purple-800 bg-[#1a1a1a] p-12 text-center">
          <h2 className="mb-6 text-xl text-foreground font-medium">Войдите через Steam для работы с тикетами</h2>
          <SteamLoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          <span className="text-gradient-brand">Тикеты — RUH PROJECT</span>
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">Среднее время ответа администрации — 4 часа.</p>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-purple-800 bg-[#1a1a1a] p-6 transition-all duration-300 hover:border-purple-500">
            <h2 className="text-xl font-bold text-foreground">Новое обращение</h2>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="subject" className="mb-2 block text-xs uppercase tracking-wide text-muted-foreground">
                  Тема
                </label>
                <input id="subject" name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="Кратко опишите проблему" className={inputClass} />
              </div>

              <div>
                <label htmlFor="category" className="mb-2 block text-xs uppercase tracking-wide text-muted-foreground">
                  Категория
                </label>
                <select id="category" name="category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                  {TICKET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-xs uppercase tracking-wide text-muted-foreground">
                  Описание
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={6}
                  placeholder="Расскажите подробнее: ник, сервер, время события"
                  className={`${inputClass} resize-none`}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] disabled:opacity-70"
              >
                {isSubmitting ? "Отправка..." : "Отправить"}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-purple-800 bg-[#1a1a1a] p-6 transition-all duration-300 hover:border-purple-500">
            <h2 className="text-xl font-bold text-foreground">Мои тикеты</h2>

            <div className="mt-6 overflow-x-auto rounded-xl border border-purple-900/40">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead className="bg-[#111111] text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Тема</th>
                    <th className="px-4 py-3">Статус</th>
                    <th className="px-4 py-3">Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">У вас пока нет тикетов</td>
                    </tr>
                  ) : tickets.map((ticket) => {
                    const status = STATUS[ticket.status] || STATUS.pending;
                    return (
                      <tr
                        key={ticket.id}
                        className="border-t border-purple-900/40 transition-all duration-300 hover:bg-[#111111]"
                      >
                        <td className="px-4 py-3 text-purple-300">#{ticket.id}</td>
                        <td className="px-4 py-3 text-foreground">{ticket.subject}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{new Date(ticket.created_at).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
