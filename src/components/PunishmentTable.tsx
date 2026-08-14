import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface PunishmentRow {
  player_name: string
  player_steamid: string
  reason: string
  type: string
  admin_name: string
  created: string
  end: string | null
  status: string
  punishmentType?: 'ban' | 'mute'
}

const BADGE: Record<string, { label: string; className: string }> = {
  ban: { label: "Бан", className: "bg-red-500/15 text-red-400 border-red-500/40" },
  mute: { label: "Мут", className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/40" },
  kick: { label: "Кик", className: "bg-neutral-500/15 text-neutral-300 border-neutral-500/40" },
};

export default function PunishmentTable({ filter = 'Все' }: { filter?: string }) {
  const [data, setData] = useState<PunishmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = () => {
    setLoading(true);
    setError(false);
    Promise.all([
      apiFetch<PunishmentRow[]>('/api/bans'),
      apiFetch<PunishmentRow[]>('/api/mutes')
    ]).then(([bans, mutes]) => {
      const b = bans.map(x => ({ ...x, punishmentType: 'ban' as const }));
      const m = mutes.map(x => ({ ...x, punishmentType: 'mute' as const }));
      const merged = [...b, ...m].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
      setData(merged);
    }).catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter((item) => {
    if (filter === 'Баны') return item.punishmentType === 'ban';
    if (filter === 'Муты') return item.punishmentType === 'mute';
    if (filter === 'Кики') return item.type.toLowerCase().includes('kick') || item.reason.toLowerCase().includes('kick');
    return true;
  });

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-8 text-center text-red-400">
        <p className="mb-4">Произошла ошибка при загрузке данных</p>
        <button
          onClick={fetchData}
          className="rounded-lg bg-red-500/20 px-4 py-2 text-sm hover:bg-red-500/30 transition-colors"
        >
          Повторить
        </button>
      </div>
    );
  }

  const getDuration = (created: string, end: string | null) => {
    if (!end) return "Навсегда";
    const diffMs = new Date(end).getTime() - new Date(created).getTime();
    if (diffMs <= 0) return "Истек";
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins} мин`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ч`;
    const days = Math.floor(hours / 24);
    return `${days} дн`;
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-purple-800 bg-[#1a1a1a]">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-[#111111] text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-5 py-3">Игрок</th>
            <th className="px-5 py-3">Тип</th>
            <th className="px-5 py-3">Причина</th>
            <th className="px-5 py-3">Администратор</th>
            <th className="px-5 py-3">Срок</th>
            <th className="px-5 py-3">Дата</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t border-purple-900/40">
                <td colSpan={6} className="px-5 py-3">
                  <div className="h-6 w-full animate-pulse rounded bg-purple-900/20" />
                </td>
              </tr>
            ))
          ) : (
            filteredData.map((item, index) => {
              const isKick = item.type.toLowerCase().includes('kick') || item.reason.toLowerCase().includes('kick');
              const badgeKey = isKick ? 'kick' : (item.punishmentType === 'ban' ? 'ban' : 'mute');
              const badge = BADGE[badgeKey] ?? BADGE["ban"];
              
              return (
                <tr
                  key={`${item.player_steamid}-${index}`}
                  className="border-t border-purple-900/40 transition-all duration-300 hover:bg-[#111111]"
                >
                  <td className="px-5 py-3 font-semibold text-foreground">{item.player_name}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badge?.className ?? ""}`}>
                      {badge?.label ?? badgeKey}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{item.reason}</td>
                  <td className="px-5 py-3 text-purple-300">{item.admin_name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{getDuration(item.created, item.end)}</td>
                  <td className="px-5 py-3 text-muted-foreground">{new Date(item.created).toLocaleDateString('ru-RU')}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
