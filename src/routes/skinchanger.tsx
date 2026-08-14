import { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useSteamAuth } from "@/hooks/useSteamAuth";
import { apiFetch, apiPost } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import SteamLoginButton from "@/components/SteamLoginButton";
import {
  SKIN_CATEGORIES,
  SKINS_DATABASE,
  RARITY_STYLES,
  type SkinItem,
} from "@/lib/skins-data";

export const Route = createFileRoute("/skinchanger")({
  head: () => ({
    meta: [
      { title: "Скинченджер — RUH PROJECT" },
      {
        name: "description",
        content: "Установите любые ножи, перчатки, скины и агенты CS2 абсолютно бесплатно для всех игроков RUH PROJECT.",
      },
    ],
  }),
  component: SkinchangerPage,
});

function SkinchangerPage() {
  const { user, isLoading: isAuthLoading } = useSteamAuth();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Equipped loadout state
  const [equippedKnife, setEquippedKnife] = useState<string | null>(null);
  const [equippedGloves, setEquippedGloves] = useState<string | null>(null);
  const [equippedCtModel, setEquippedCtModel] = useState<string | null>(null);
  const [equippedTModel, setEquippedTModel] = useState<string | null>(null);
  const [equippedSkins, setEquippedSkins] = useState<Record<string, string>>({});

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch current loadout from backend on mount
  useEffect(() => {
    async function loadSkinConfig() {
      if (!user?.steamid) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await apiFetch<{
          knife: string | null;
          gloves: string | null;
          ct_model: string | null;
          t_model: string | null;
          skins: Record<string, string>;
        }>(`/api/skins/${user.steamid}`);

        if (data) {
          setEquippedKnife(data.knife);
          setEquippedGloves(data.gloves);
          setEquippedCtModel(data.ct_model);
          setEquippedTModel(data.t_model);
          setEquippedSkins(data.skins || {});
        }
      } catch (err) {
        console.error("Failed to load skin config:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (!isAuthLoading) {
      void loadSkinConfig();
    }
  }, [user, isAuthLoading]);

  // Filtered skins based on category & search
  const filteredSkins = useMemo(() => {
    return SKINS_DATABASE.filter((skin) => {
      const matchesCategory =
        activeCategory === "all" || skin.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        skin.skinName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skin.weapon.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Check if an item is currently equipped
  const isEquipped = (skin: SkinItem) => {
    if (skin.category === "knives") return equippedKnife === skin.id;
    if (skin.category === "gloves") return equippedGloves === skin.id;
    if (skin.category === "agents") {
      return skin.subCategory === "ct"
        ? equippedCtModel === skin.id
        : equippedTModel === skin.id;
    }
    return equippedSkins[skin.weapon] === skin.id;
  };

  // Toggle or select item
  const handleToggleSkin = (skin: SkinItem) => {
    if (skin.category === "knives") {
      setEquippedKnife((prev) => (prev === skin.id ? null : skin.id));
    } else if (skin.category === "gloves") {
      setEquippedGloves((prev) => (prev === skin.id ? null : skin.id));
    } else if (skin.category === "agents") {
      if (skin.subCategory === "ct") {
        setEquippedCtModel((prev) => (prev === skin.id ? null : skin.id));
      } else {
        setEquippedTModel((prev) => (prev === skin.id ? null : skin.id));
      }
    } else {
      setEquippedSkins((prev) => {
        const next = { ...prev };
        if (next[skin.weapon] === skin.id) {
          delete next[skin.weapon];
        } else {
          next[skin.weapon] = skin.id;
        }
        return next;
      });
    }
  };

  // Save to database via API
  const handleSaveSkins = async () => {
    if (!user?.steamid) {
      toast.error("Войдите через Steam чтобы сохранить скины");
      return;
    }

    setIsSaving(true);
    try {
      await apiPost("/api/skins", {
        steamid: user.steamid,
        knife: equippedKnife,
        gloves: equippedGloves,
        ct_model: equippedCtModel,
        t_model: equippedTModel,
        skins: equippedSkins,
      });

      toast.success("✨ Скины применены на сервере!", {
        description: "Изменения вступят в силу в следующем раунде или при переподключении.",
      });
    } catch (err) {
      console.error(err);
      toast.error("Не удалось сохранить скины на сервере.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="pt-20 flex justify-center items-center py-32">
        <LoadingSpinner text="Загрузка скинченджера..." />
      </div>
    );
  }

  return (
    <div className="pt-20 pb-24 bg-[#0a0a0c] min-h-screen text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              <span className="text-gradient-brand">Скинченджер — RUH PROJECT</span>
            </h1>
            <p className="mt-2 text-muted-foreground text-sm sm:text-base">
              Устанавливайте любые ножи, перчатки, модели оружия и агентов. Доступно бесплатно для всех игроков!
            </p>
          </div>

          {user && (
            <button
              onClick={handleSaveSkins}
              disabled={isSaving}
              className="self-start md:self-auto rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-8 py-3.5 text-sm font-bold text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] active:scale-95 disabled:opacity-50"
            >
              {isSaving ? "Применение..." : "✨ Применить в игре"}
            </button>
          )}
        </div>

        {/* Not Logged In Banner */}
        {!user && (
          <div className="mb-10 rounded-2xl border border-[#22222a] bg-[#141418] p-8 text-center shadow-[0_0_30px_rgba(124,58,237,0.15)]">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Войдите через Steam чтобы использовать Скинченджер
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto text-sm">
              Ваш выбор автоматически сохранится в базе данных сервера и применится сразу в следующем раунде CS2!
            </p>
            <div className="inline-block">
              <SteamLoginButton />
            </div>
          </div>
        )}

        {/* Active Loadout Summary Bar */}
        {user && (
          <div className="mb-8 rounded-2xl border border-[#22222a] bg-[#141418] p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-300 uppercase tracking-wider">
              <span>Активный сет:</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className={`px-3 py-1.5 rounded-xl border ${equippedKnife ? 'border-amber-500/50 bg-amber-500/10 text-amber-400 font-medium' : 'border-[#262630] text-muted-foreground'}`}>
                🔪 Нож: {equippedKnife ? SKINS_DATABASE.find(s => s.id === equippedKnife)?.skinName ?? "Выбран" : "Стандарт"}
              </span>
              <span className={`px-3 py-1.5 rounded-xl border ${equippedGloves ? 'border-purple-500/50 bg-purple-500/10 text-purple-300 font-medium' : 'border-[#262630] text-muted-foreground'}`}>
                🧤 Перчатки: {equippedGloves ? SKINS_DATABASE.find(s => s.id === equippedGloves)?.skinName ?? "Выбраны" : "Стандарт"}
              </span>
              <span className={`px-3 py-1.5 rounded-xl border ${Object.keys(equippedSkins).length > 0 ? 'border-green-500/50 bg-green-500/10 text-green-400 font-medium' : 'border-[#262630] text-muted-foreground'}`}>
                🔫 Оружие: {Object.keys(equippedSkins).length} скин(ов)
              </span>
            </div>
          </div>
        )}

        {/* Controls: Search & Category Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {SKIN_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  activeCategory === cat.id
                    ? "bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-primary-foreground shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                    : "border border-[#262630] bg-[#141418] text-muted-foreground hover:border-purple-500 hover:text-purple-300"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px]">
            <input
              type="text"
              placeholder="Поиск скина или оружия..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#262630] bg-[#141418] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Skins Grid (Matches Photo 2 Layout & Style) */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSkins.map((skin) => {
            const equipped = isEquipped(skin);
            const rarityStyle = RARITY_STYLES[skin.rarity];

            return (
              <SkinCardItem
                key={skin.id}
                skin={skin}
                equipped={equipped}
                rarityStyle={rarityStyle}
                onToggle={() => handleToggleSkin(skin)}
              />
            );
          })}
        </div>

        {/* Empty state */}
        {filteredSkins.length === 0 && (
          <div className="py-20 text-center rounded-2xl border border-[#22222a] bg-[#141418]">
            <p className="text-lg text-muted-foreground">
              Скины по вашему запросу не найдены.
            </p>
            <button
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
              }}
              className="mt-4 text-sm text-purple-400 underline hover:text-purple-300"
            >
              Сбросить фильтры
            </button>
          </div>
        )}

        {/* Sticky Apply Button for Mobile/Scroll */}
        {user && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={handleSaveSkins}
              disabled={isSaving}
              className="rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-10 py-4 text-base font-bold text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] disabled:opacity-50"
            >
              {isSaving ? "Применение..." : "✨ Сохранить и применить на сервере"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface SkinCardItemProps {
  skin: SkinItem;
  equipped: boolean;
  rarityStyle: { label: string; nameColor: string; bgGlow: string; border: string };
  onToggle: () => void;
}

function SkinCardItem({ skin, equipped, rarityStyle, onToggle }: SkinCardItemProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={onToggle}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border bg-[#141418] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between min-h-[280px] ${
        equipped
          ? `border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)] bg-[#181424]`
          : "border-[#22222a] hover:border-purple-500/60"
      }`}
    >
      {/* Top Badge (Photo 2 Style: Small Icon Box on Top Right) */}
      <div className="flex items-center justify-between w-full z-10">
        <span className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">
          {skin.category}
        </span>
        <div className="flex items-center justify-center rounded-xl bg-[#1d1d24] border border-[#2a2a36] p-2 text-amber-400/90 shadow-sm">
          {equipped ? (
            <span className="text-xs font-bold text-purple-400">✓</span>
          ) : (
            <span className="text-xs">⚔️</span>
          )}
        </div>
      </div>

      {/* Center Skin Render Image with Soft Rarity Radial Glow (Photo 2 Style) */}
      <div className="relative flex h-36 items-center justify-center py-2 my-auto">
        {/* Subtle Radial Glow matching rarity color behind weapon */}
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-40 transition-opacity group-hover:opacity-70 pointer-events-none"
          style={{ background: rarityStyle.bgGlow }}
        />

        {!imgError ? (
          <img
            src={skin.image}
            alt={`${skin.weapon} ${skin.skinName}`}
            onError={() => setImgError(true)}
            className="relative z-10 max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_12px_12px_rgba(0,0,0,0.7)]"
            loading="lazy"
          />
        ) : (
          <div className="relative z-10 flex flex-col items-center justify-center h-full w-full rounded-xl bg-[#1d1d24]/60 border border-[#2a2a36] p-4">
            <span className="text-5xl mb-2">{skin.emoji ?? "🔪"}</span>
          </div>
        )}
      </div>

      {/* Bottom Information Block (Photo 2 Style: ★ Weapon \n SkinName in Rarity Color) */}
      <div className="pt-2 z-10">
        <h4 className="text-sm font-bold text-white/90 flex items-center gap-1">
          {skin.weapon}
        </h4>
        <h3 className={`text-base sm:text-lg font-extrabold leading-tight mt-0.5 ${rarityStyle.nameColor}`}>
          {skin.skinName}
        </h3>
      </div>
    </div>
  );
}
