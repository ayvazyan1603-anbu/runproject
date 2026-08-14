import type { Privilege } from "@/types";
import { useSteamAuth } from "@/hooks/useSteamAuth";

interface Props {
  privilege: Privilege;
  index?: number;
  onBuy?: () => void;
}

export default function PrivilegeCard({ privilege, index = 0, onBuy }: Props) {
  const { user, login } = useSteamAuth();
  const { name, price, features, isPopular } = privilege;

  return (
    <div
      style={{ animationDelay: `${index * 120}ms` }}
      className={
        isPopular
          ? "animate-fade-in-up relative rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] p-[2px] shadow-[0_0_30px_rgba(168,85,247,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(168,85,247,0.55)]"
          : "animate-fade-in-up relative rounded-2xl border border-purple-800 bg-[#1a1a1a] transition-all duration-300 hover:-translate-y-1 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
      }
    >
      {isPopular && (
        <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
          Популярное
        </span>
      )}

      <div className={isPopular ? "flex h-full flex-col rounded-2xl bg-[#1a1a1a] p-6" : "flex h-full flex-col p-6"}>
        <h3 className="text-lg font-bold text-foreground">{name}</h3>

        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-4xl font-extrabold text-gradient-logo">{price.toLocaleString("ru-RU")}</span>
          <span className="text-sm text-muted-foreground">₸ / мес</span>
        </div>

        <ul className="mt-5 flex-1 space-y-2.5">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-0.5 text-purple-400">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => {
            if (user) {
              onBuy?.();
            } else {
              login();
            }
          }}
          className="mt-6 w-full rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]"
        >
          {user ? "Купить" : "Войдите через Steam"}
        </button>
      </div>
    </div>
  );
}
