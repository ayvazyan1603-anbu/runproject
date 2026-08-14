import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { parseSteamIdFromClaimedId } from "@/lib/steam-api";
import { useSteamAuth } from "@/hooks/useSteamAuth";
import LoadingSpinner from "@/components/LoadingSpinner";

export const Route = createFileRoute("/auth/steam")({
  head: () => ({
    meta: [
      { title: "Авторизация Steam — RUH PROJECT" },
      { name: "description", content: "Обработка авторизации через Steam" },
    ],
  }),
  component: SteamAuthCallback,
});

function SteamAuthCallback() {
  const navigate = useNavigate();
  const { loadUserBySteamId } = useSteamAuth();
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function handleAuth() {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const claimedId = searchParams.get("openid.claimed_id");

        if (!claimedId) {
          if (isMounted) {
            setErrorMessage("Не удалось авторизоваться через Steam");
            setStatus("error");
          }
          return;
        }

        const steamId = parseSteamIdFromClaimedId(claimedId);
        if (!steamId) {
          if (isMounted) {
            setErrorMessage("Не удалось авторизоваться через Steam");
            setStatus("error");
          }
          return;
        }

        await loadUserBySteamId(steamId);

        if (isMounted) {
          setStatus("success");
          navigate({ to: "/profile" });
        }
      } catch (error) {
        console.error("Steam authentication error:", error);
        if (isMounted) {
          setErrorMessage("Не удалось авторизоваться через Steam");
          setStatus("error");
        }
      }
    }

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [loadUserBySteamId, navigate]);

  return (
    <div className="relative pt-20 flex min-h-screen items-center justify-center px-4 overflow-hidden">
      {/* Purple gradient background elements for visual appeal */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#7c3aed] opacity-20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full bg-[#a855f7] opacity-10 blur-[120px]" />

      {status === "error" ? (
        <div className="relative z-10 w-full max-w-md text-center animate-fade-in-up">
          <div className="rounded-xl border border-purple-800 bg-[#1a1a1a] p-8 shadow-xl space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Ошибка авторизации</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {errorMessage || "Не удалось авторизоваться через Steam"}
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]"
            >
              На главную
            </Link>
          </div>
        </div>
      ) : (
        <div className="relative z-10 w-full max-w-md text-center animate-fade-in-up">
          <div className="rounded-xl border border-purple-800 bg-[#1a1a1a] p-8 shadow-xl">
            <LoadingSpinner size="lg" text="Авторизация через Steam..." />
          </div>
        </div>
      )}
    </div>
  );
}
