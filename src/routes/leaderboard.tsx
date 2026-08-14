import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import LeaderboardTable from "@/components/LeaderboardTable";
import FaceitLeaderboardTable from "@/components/FaceitLeaderboardTable";
import { LEADERBOARD_FILTERS } from "@/lib/mock-data";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Лидеры — RUH PROJECT" },
      {
        name: "description",
        content: "Таблица лидеров RUH PROJECT: топ игроков по очкам, убийствам, K/D, наигранному времени и Faceit ELO.",
      },
      { property: "og:title", content: "Лидеры — RUH PROJECT" },
      { property: "og:description", content: "Топ-10 игроков RUH PROJECT по очкам, убийствам, K/D и Faceit ELO." },
    ],
  }),
  component: LeaderboardPage,
});

type LeaderboardTab = "server" | "faceit";

function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("server");

  const tabs: { id: LeaderboardTab; label: string }[] = [
    { id: "server", label: "Сервер" },
    { id: "faceit", label: "Faceit" },
  ];

  return (
    <div className="pt-20">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          <span className="text-gradient-brand">Лидеры — RUH PROJECT</span>
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">Статистика обновляется каждые 15 минут.</p>

        {/* Tabs */}
        <div className="mt-8 flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-primary-foreground shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                  : "border border-purple-800 bg-[#111111] text-muted-foreground hover:border-purple-500 hover:text-purple-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Server tab — existing leaderboard with filters */}
        {activeTab === "server" && (
          <div>
            <div className="mt-6 flex flex-wrap gap-2">
              {LEADERBOARD_FILTERS.map((filter, i) => (
                <button
                  key={filter}
                  type="button"
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    i === 0
                      ? "bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-primary-foreground"
                      : "border border-purple-800 bg-[#111111] text-muted-foreground hover:border-purple-500 hover:text-purple-400"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <LeaderboardTable />
            </div>
          </div>
        )}

        {/* Faceit tab — Faceit ELO leaderboard */}
        {activeTab === "faceit" && (
          <div className="mt-6">
            <p className="mb-4 text-sm text-muted-foreground">
              Топ игроков проекта по рейтингу Faceit ELO в CS2.
            </p>
            <FaceitLeaderboardTable />
          </div>
        )}
      </div>
    </div>
  );
}
