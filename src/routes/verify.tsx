import { useState, useEffect } from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useSteamAuth } from "@/hooks/useSteamAuth";
import SteamLoginButton from "@/components/SteamLoginButton";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Верификация Steam — RUH PROJECT" },
      { name: "description", content: "Привязка Steam аккаунта к Discord боту RUH PROJECT." },
    ],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const [discordId, setDiscordId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setDiscordId(params.get("discord_id"));
    }
  }, []);

  const { user, isLoggedIn, isLoading: isAuthLoading } = useSteamAuth();

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    async function submitVerification() {
      if (!isLoggedIn || !user?.steamid || !discordId) return;

      setStatus("submitting");

      try {
        const API_URL = (import.meta.env["VITE_API_URL"] as string | undefined) || "http://localhost:3001";
        const res = await fetch(`${API_URL}/api/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            discord_id: discordId,
            steamid: user.steamid,
            player_name: user.personaname || "Игрок",
          }),
        });

        if (!res.ok) {
          throw new Error("Не удалось привязать аккаунт");
        }

        setStatus("success");
        toast.success("✅ Аккаунт верифицирован!", {
          description: "Роль 'Верифицирован' выдана в Discord.",
        });
      } catch (err: any) {
        console.error(err);
        setStatus("error");
        setErrorMessage(err.message || " Ошибка привязки аккаунта.");
      }
    }

    if (!isAuthLoading) {
      void submitVerification();
    }
  }, [isLoggedIn, user, discordId, isAuthLoading]);

  if (isAuthLoading || status === "submitting") {
    return (
      <div className="pt-20 flex flex-col items-center justify-center py-32">
        <LoadingSpinner text="Выполняется верификация..." />
      </div>
    );
  }

  return (
    <div className="pt-20 pb-24">
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <div className="rounded-2xl border border-purple-800 bg-[#1a1a1a] p-8 sm:p-12 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gradient-brand">
            🔗 Верификация Discord & Steam
          </h1>

          {!discordId ? (
            <div className="mt-6 text-yellow-400 bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/30 text-sm">
              ⚠️ Отсутствует параметр Discord ID. Пожалуйста, используйте команду <code>/verify</code> в нашем Discord сервере.
            </div>
          ) : status === "success" ? (
            <div className="mt-6 space-y-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-3xl text-green-400 border border-green-500/40">
                ✓
              </div>
              <h2 className="text-xl font-bold text-foreground">Успешно верифицировано!</h2>
              <p className="text-sm text-muted-foreground">
                Ваш SteamID (<strong>{user?.steamid}</strong>) успешно привязан к Discord ID (<strong>{discordId}</strong>).
                Бот уже выдал вам роль в Discord!
              </p>
              <div className="pt-4">
                <a
                  href="https://discord.gg/ruhproject"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-8 py-3 text-sm font-semibold text-primary-foreground hover:scale-105 transition-all"
                >
                  Вернуться в Discord
                </a>
              </div>
            </div>
          ) : !isLoggedIn ? (
            <div className="mt-6 space-y-6">
              <p className="text-sm text-muted-foreground">
                Вы перешли по ссылке привязки для Discord ID: <code className="text-purple-300 font-bold">{discordId}</code>.
                Войдите через Steam ниже чтобы подтвердить владение аккаунтом.
              </p>
              <div className="flex justify-center">
                <SteamLoginButton />
              </div>
            </div>
          ) : status === "error" ? (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/30">
                {errorMessage}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
