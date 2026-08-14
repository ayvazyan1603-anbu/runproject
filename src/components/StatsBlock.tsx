import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";

function parseValue(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return Number(digits || 0);
}

function AnimatedNumber({ raw }: { raw: string }) {
  const target = parseValue(raw);
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    let started = false;

    const run = () => {
      const duration = 1400;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(Math.round(target * eased));
        if (p < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started) {
          started = true;
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target]);

  return (
    <p ref={ref} className="text-3xl font-extrabold text-gradient-logo sm:text-4xl">
      {value.toLocaleString("ru-RU")}
    </p>
  );
}

export default function StatsBlock() {
  const [stats, setStats] = useState([
    { label: "Всего игроков", value: "1" },
    { label: "Онлайн на сервере", value: "0" },
    { label: "VIP-аккаунтов", value: "1" },
    { label: "Забанено", value: "0" },
  ]);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        const [ranks, bans, serverStatus] = await Promise.all([
          apiFetch<any[]>('/api/ranks').catch(() => []),
          apiFetch<any[]>('/api/bans').catch(() => []),
          apiFetch<{ players: number }>('/api/server-status').catch(() => ({ players: 0 })),
        ]);

        if (isMounted) {
          const totalPlayers = Math.max(ranks.length, 1);
          const totalBans = bans.length;
          const liveOnline = serverStatus.players || 0;

          setStats([
            { label: "Всего игроков", value: totalPlayers.toString() },
            { label: "Онлайн на сервере", value: liveOnline.toString() },
            { label: "VIP-аккаунтов", value: "1" },
            { label: "Забанено", value: totalBans.toString() },
          ]);
        }
      } catch {
        // Keep default state
      }
    }

    void loadStats();
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          style={{ animationDelay: `${i * 100}ms` }}
          className="animate-fade-in-up rounded-xl border border-purple-800 bg-[#1a1a1a] p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
        >
          <AnimatedNumber raw={stat.value} />
          <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
