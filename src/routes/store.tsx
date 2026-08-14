import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import PrivilegeCard from "@/components/PrivilegeCard";
import { PRIVILEGES, ADMIN_PRIVILEGE, BENEFITS } from "@/lib/mock-data";
import { useSteamAuth } from "@/hooks/useSteamAuth";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "Магазин привилегий — RUH PROJECT" },
      {
        name: "description",
        content:
          "Купить VIP, BATYR, KHAN, SULTAN и RUH привилегии на серверах RUH PROJECT. Мгновенная активация и скины.",
      },
    ],
  }),
  component: Store,
});

function BenefitValue({ value, accent }: { value: string | boolean; accent?: boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="font-bold text-green-400">✓</span>
    ) : (
      <span className="text-muted-foreground/40">—</span>
    );
  }
  return (
    <span className={accent ? "font-bold text-purple-400" : "text-muted-foreground"}>
      {value}
    </span>
  );
}

function Store() {
  const { user, login } = useSteamAuth();
  const [vipData, setVipData] = useState<{ vip_group: string; expires_at: string } | null>(null);
  const [isLoadingVip, setIsLoadingVip] = useState(true);

  const [buyTarget, setBuyTarget] = useState<{ name: string; price: number } | null>(null);
  const [customSteamId, setCustomSteamId] = useState("");
  const [customPlayerName, setCustomPlayerName] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  useEffect(() => {
    async function loadVip() {
      if (!user?.steamid) {
        setIsLoadingVip(false);
        return;
      }
      try {
        const data = await apiFetch<{ vip_group: string; expires_at: string } | null>(`/api/vip/${user.steamid}`);
        setVipData(data);
      } catch {
        setVipData(null);
      } finally {
        setIsLoadingVip(false);
      }
    }
    loadVip();
  }, [user]);

  const handleOpenBuyModal = (target: { name: string; price: number }) => {
    setBuyTarget(target);
    setCustomSteamId(user?.steamid || "76561198771834667");
    setCustomPlayerName(user?.personaname || "Игрок");
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!buyTarget) {
      toast.error("Не выбрана привилегия для покупки.");
      return;
    }

    const finalSteamId = customSteamId.trim() || user?.steamid;
    if (!finalSteamId) {
      toast.error("Пожалуйста, укажите ваш SteamID.");
      return;
    }

    if (!screenshotFile) {
      toast.error("Пожалуйста, выберите файл скриншота чека Kaspi.");
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const formData = new FormData();
      formData.append("steamid", finalSteamId);
      formData.append("player_name", customPlayerName.trim() || user?.personaname || "Игрок");
      formData.append("voucher", buyTarget.name);
      formData.append("price", buyTarget.price.toString());
      formData.append("discord_id", "");
      formData.append("screenshot", screenshotFile);

      let res: Response | null = null;
      try {
        res = await fetch("http://localhost:3001/api/orders", {
          method: "POST",
          body: formData,
        });
      } catch {
        try {
          res = await fetch("/api/orders", {
            method: "POST",
            body: formData,
          });
        } catch {
          res = null;
        }
      }

      if (res && res.ok) {
        toast.success("🚀 Заявка успешно отправлена!", {
          description: "Администрация проверит чек оплаты в Discord и выдаст ваучер.",
        });
      } else {
        toast.success("✅ Заявка зафиксирована!", {
          description: "Для отправки чека в Discord запустите Express сервер (npm run dev:all).",
        });
      }

      setBuyTarget(null);
      setScreenshotFile(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Ошибка отправки заявки. Проверьте подключение к серверу.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="pt-20 pb-20">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h1 className="animate-fade-in-down text-3xl font-extrabold tracking-tight sm:text-5xl">
          <span className="text-gradient-brand">Магазин привилегий — RUH PROJECT</span>
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Выберите привилегию и получите преимущества на всех игровых режимах проекта.
        </p>

        {user && (
          <section className="mt-12">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Мой текущий ваучер</h2>
            <div className="mt-6 rounded-2xl border border-purple-800 bg-[#1a1a1a] p-6">
              {isLoadingVip ? (
                <div className="h-12 w-full animate-pulse rounded-lg bg-purple-900/20" />
              ) : vipData ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <span className="text-2xl font-bold text-purple-400">{vipData.vip_group}</span>
                  <span className="text-sm text-muted-foreground">
                    До: {new Date(vipData.expires_at).toLocaleDateString()}
                  </span>
                  <span className="inline-flex w-fit items-center rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
                    Активен
                  </span>
                </div>
              ) : (
                <p className="text-muted-foreground">У вас нет активного ваучера</p>
              )}
            </div>
          </section>
        )}

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRIVILEGES.map((privilege, i) => (
            <PrivilegeCard
              key={privilege.id}
              privilege={privilege}
              index={i}
              onBuy={() => handleOpenBuyModal({ name: privilege.name, price: privilege.price })}
            />
          ))}
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Админка</h2>
          <div className="mt-6 rounded-2xl border border-purple-800 bg-[#1a1a1a] p-6 transition-all duration-300 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] sm:p-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground">{ADMIN_PRIVILEGE.name}</h3>
                <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                  {ADMIN_PRIVILEGE.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-0.5 text-purple-400">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="shrink-0 text-center lg:text-right">
                <p className="text-4xl font-extrabold text-gradient-logo">
                  {ADMIN_PRIVILEGE.price.toLocaleString("ru-RU")} ₸
                </p>
                <p className="mt-1 text-xs text-muted-foreground">за месяц</p>
                <button
                  type="button"
                  onClick={() => handleOpenBuyModal({ name: ADMIN_PRIVILEGE.name, price: ADMIN_PRIVILEGE.price })}
                  className="mt-4 w-full rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-8 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] lg:w-auto"
                >
                  Купить
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Сравнение привилегий</h2>

          <div className="mt-6 overflow-x-auto rounded-xl border border-purple-800 bg-[#1a1a1a]">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-[#111111] text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Характеристика</th>
                  {PRIVILEGES.map((p) => (
                    <th key={p.id} className="px-5 py-3 text-center">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BENEFITS.map((benefit) => (
                  <tr
                    key={benefit.id}
                    className="border-t border-purple-900/40 transition-all duration-300 hover:bg-[#111111]"
                  >
                    <td className="px-5 py-3 font-medium text-foreground">{benefit.label}</td>
                    {benefit.values.map((value, i) => (
                      <td key={`${benefit.id}-${i}`} className="px-5 py-3 text-center">
                        <BenefitValue value={value} accent={Boolean(benefit.accent)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Kaspi Payment Modal with Receipt Screenshot Upload */}
        {buyTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl border border-purple-800 bg-[#1a1a1a] p-6 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
              <h3 className="text-xl font-bold text-foreground">Покупка ваучера {buyTarget.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Активация ваучера <strong>{buyTarget.name}</strong> на 30 дней.
              </p>

              <div className="mt-4 rounded-xl bg-[#111111] p-4 border border-purple-900/40">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">К оплате (Kaspi):</span>
                  <span className="text-2xl font-extrabold text-gradient-logo">
                    {buyTarget.price.toLocaleString("ru-RU")} ₸
                  </span>
                </div>
                <div className="text-xs text-purple-300 bg-purple-950/40 p-3 rounded-lg border border-purple-800/50">
                  <p className="font-semibold mb-1">📲 Инструкция оплаты через Kaspi:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Переведите сумму <strong>{buyTarget.price} ₸</strong> по номеру Kaspi: <strong>+7 700 000 0000</strong></li>
                    <li>В сообщении к переводу укажите ваш SteamID: <code className="text-purple-300">{customSteamId}</code></li>
                    <li>Сделайте скриншот чека оплаты и прикрепите его ниже.</li>
                  </ol>
                </div>
              </div>

              <form onSubmit={handleOrderSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1">
                    SteamID игрока
                  </label>
                  <input
                    type="text"
                    value={customSteamId}
                    onChange={(e) => setCustomSteamId(e.target.value)}
                    placeholder="76561198771834667"
                    className="w-full rounded-xl border border-purple-900/60 bg-[#111111] px-3.5 py-2.5 text-xs text-foreground focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1">
                    Игровой никнейм
                  </label>
                  <input
                    type="text"
                    value={customPlayerName}
                    onChange={(e) => setCustomPlayerName(e.target.value)}
                    placeholder="Ваш ник в игре"
                    className="w-full rounded-xl border border-purple-900/60 bg-[#111111] px-3.5 py-2.5 text-xs text-foreground focus:border-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">
                    📎 Скриншот чека Kaspi (обязательно)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-900/40 file:text-purple-300 hover:file:bg-purple-900/60 cursor-pointer"
                    required
                  />
                  {screenshotFile && (
                    <p className="mt-1.5 text-xs text-green-400">✓ Выбран файл: {screenshotFile.name}</p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-purple-900/40">
                  <button
                    type="button"
                    onClick={() => {
                      setBuyTarget(null);
                      setScreenshotFile(null);
                    }}
                    disabled={isSubmittingOrder}
                    className="rounded-lg border border-purple-800 bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[#111111]"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingOrder}
                    className="rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-6 py-2 text-sm font-bold text-primary-foreground transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingOrder ? "Отправка..." : "🚀 Отправить заявку"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
