import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useSteamAuth } from '@/hooks/useSteamAuth';
import { useFaceitBySteamId } from '@/hooks/useFaceitPlayer';
import FaceitLevelBadge from '@/components/FaceitLevelBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBlock from '@/components/ErrorBlock';
import SteamLoginButton from '@/components/SteamLoginButton';
import { STEAM_PERSONA_STATES } from '@/types';
import { apiFetch } from '@/lib/api';
import { Link } from '@tanstack/react-router';

interface VipItem {
  vip_group: string;
  expires_at: string;
  expires?: number;
}

interface OrderItem {
  id: number;
  voucher: string;
  price: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface PlayerData {
  vip?: VipItem | null;
  vips?: VipItem[];
  orders?: OrderItem[];
  stats?: {
    kills: number;
    deaths: number;
    kd: number;
    hs: number;
    playtime: number;
    rank: number;
  } | null;
}

export const Route = createFileRoute('/profile')({
  head: () => ({
    meta: [
      { title: "Мой профиль — RUH PROJECT" },
      { name: "description", content: "Профиль игрока RUH PROJECT" },
    ],
  }),
  component: ProfilePage,
});

const COUNTRY_FLAGS: Record<string, string> = {
  ru: '🇷🇺', ua: '🇺🇦', kz: '🇰🇿', by: '🇧🇾', de: '🇩🇪',
  pl: '🇵🇱', fr: '🇫🇷', se: '🇸🇪', dk: '🇩🇰', fi: '🇫🇮'
};

function ProfilePage() {
  const { user, isLoading: isSteamLoading } = useSteamAuth();
  
  const faceit = useFaceitBySteamId(user?.steamid || '');
  
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [isPlayerLoading, setIsPlayerLoading] = useState(false);

  const loadPlayerData = async () => {
    if (!user?.steamid) return;
    setIsPlayerLoading(true);
    try {
      const data = await apiFetch<PlayerData>(`/api/player/${user.steamid}`);
      setPlayerData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPlayerLoading(false);
    }
  };

  useEffect(() => {
    loadPlayerData();
  }, [user]);

  if (isSteamLoading) {
    return (
      <div className="pt-20 mx-auto max-w-7xl px-4 py-16 sm:px-6 flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-20 mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-col items-center justify-center rounded-xl border border-purple-800 bg-[#1a1a1a] p-12 text-center animate-fade-in-up">
          <h2 className="mb-6 text-xl text-foreground font-medium">
            Войдите через Steam чтобы увидеть профиль
          </h2>
          <SteamLoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 mx-auto max-w-7xl px-4 py-16 sm:px-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-extrabold text-gradient-brand">
          Мой профиль
        </h1>
        <button
          onClick={loadPlayerData}
          disabled={isPlayerLoading}
          className="px-4 py-2 text-sm font-semibold rounded-lg border border-purple-700 bg-purple-950/40 text-purple-300 hover:bg-purple-900/60 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isPlayerLoading ? <LoadingSpinner /> : '🔄 Обновить данные'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Steam Block */}
        <div className="rounded-xl border border-purple-800 bg-[#1a1a1a] p-6 flex flex-col md:flex-row items-center md:items-start gap-6 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-shadow">
          <img
            src={user.avatarfull}
            alt={user.personaname}
            className="h-24 w-24 rounded-full border-2 border-purple-500 object-cover"
          />
          <div className="flex flex-col items-center md:items-start space-y-2">
            <h2 className="text-2xl font-bold text-foreground">{user.personaname}</h2>
            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${user.personastate === 0 ? 'bg-gray-500' : 'bg-green-500 animate-pulse'}`}></span>
              <span className={`text-sm ${STEAM_PERSONA_STATES[user.personastate]?.color ?? 'text-muted-foreground'}`}>
                {STEAM_PERSONA_STATES[user.personastate]?.label ?? 'Неизвестно'}
              </span>
            </div>
            <a
              href={user.profileurl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
            >
              Перейти в профиль Steam
            </a>
            <div className="text-xs text-muted-foreground font-mono pt-2">
              SteamID64: {user.steamid}
            </div>
            {user.timecreated && (
              <div className="text-xs text-muted-foreground">
                Зарегистрирован: {new Date(user.timecreated * 1000).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Faceit Block */}
        <div className="rounded-xl border border-purple-800 bg-[#1a1a1a] p-6 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-shadow">
          {faceit.isLoading ? (
            <div className="flex justify-center items-center h-full min-h-[150px]">
              <LoadingSpinner />
            </div>
          ) : faceit.error ? (
            <ErrorBlock message="Не удалось загрузить данные Faceit" />
          ) : faceit.player ? (
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-foreground">
                    {faceit.player.nickname}
                  </h2>
                  <span className="text-xl" title={faceit.player.country}>
                    {COUNTRY_FLAGS[faceit.player.country.toLowerCase()] || faceit.player.country.toUpperCase()}
                  </span>
                </div>
                {faceit.player.games?.cs2?.skill_level && (
                  <FaceitLevelBadge level={faceit.player.games.cs2.skill_level} size="lg" />
                )}
              </div>
              
              <div className="mb-4">
                <span className="text-3xl font-bold text-purple-300">
                  {faceit.player.games?.cs2?.faceit_elo || 'N/A'} <span className="text-sm text-muted-foreground font-normal">ELO</span>
                </span>
              </div>
              
              {faceit.stats && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-purple-900/40">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase">Win Rate</div>
                    <div className="text-lg font-semibold text-foreground">{faceit.stats.lifetime['Win Rate %'] ?? '-'}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase">Matches</div>
                    <div className="text-lg font-semibold text-foreground">{faceit.stats.lifetime.Matches || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase">K/D</div>
                    <div className="text-lg font-semibold text-foreground">{faceit.stats.lifetime['Average K/D Ratio'] || '-'}</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center items-center h-full min-h-[150px]">
              <span className="text-muted-foreground">Faceit аккаунт не привязан</span>
            </div>
          )}
        </div>
      </div>

      {isPlayerLoading ? (
        <div className="mt-8 rounded-xl border border-purple-800 bg-[#1a1a1a] p-12 flex justify-center items-center">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* My Voucher Block */}
          <div className="mt-8 rounded-xl border border-purple-800 bg-[#1a1a1a] p-6 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-shadow animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-2xl font-bold text-foreground mb-4">Мой ваучер</h2>
            {playerData?.vip ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#111111] p-4 rounded-lg border border-purple-900/40">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-extrabold text-purple-400">{playerData.vip.vip_group}</span>
                    <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400 border border-green-500/20">
                      Активен
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    До: {new Date(playerData.vip.expires_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex-1 max-w-md">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Прогресс</span>
                    <span className="text-purple-400">
                      {Math.max(0, Math.ceil((new Date(playerData.vip.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} дней осталось
                    </span>
                  </div>
                  <div className="w-full bg-purple-950/30 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-[#7c3aed] to-[#a855f7] h-2.5 rounded-full" style={{ width: `${Math.min(100, Math.max(0, (Math.ceil((new Date(playerData.vip.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) / 30) * 100))}%` }}></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <p className="text-muted-foreground mb-4">Нет активного ваучера</p>
                <Link to="/store" className="rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#a855f7] px-6 py-2 text-sm font-semibold text-primary-foreground hover:scale-105 transition-all">
                  Перейти в магазин
                </Link>
              </div>
            )}
          </div>

          {/* Server Stats Block */}
          <div className="mt-8 rounded-xl border border-purple-800 bg-[#1a1a1a] p-6 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-shadow animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <h2 className="text-2xl font-bold text-foreground mb-4">Моя статистика сервера</h2>
            {playerData?.stats ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-[#111111] p-4 rounded-lg border border-purple-900/30 flex flex-col items-center justify-center text-center hover:border-purple-500/50 transition-colors">
                  <span className="text-xs text-muted-foreground uppercase mb-1">Убийства</span>
                  <span className="text-2xl font-bold text-purple-300">{playerData.stats.kills}</span>
                </div>
                <div className="bg-[#111111] p-4 rounded-lg border border-purple-900/30 flex flex-col items-center justify-center text-center hover:border-purple-500/50 transition-colors">
                  <span className="text-xs text-muted-foreground uppercase mb-1">Смерти</span>
                  <span className="text-2xl font-bold text-purple-300">{playerData.stats.deaths}</span>
                </div>
                <div className="bg-[#111111] p-4 rounded-lg border border-purple-900/30 flex flex-col items-center justify-center text-center hover:border-purple-500/50 transition-colors">
                  <span className="text-xs text-muted-foreground uppercase mb-1">K/D</span>
                  <span className="text-2xl font-bold text-purple-300">{playerData.stats.kd}</span>
                </div>
                <div className="bg-[#111111] p-4 rounded-lg border border-purple-900/30 flex flex-col items-center justify-center text-center hover:border-purple-500/50 transition-colors">
                  <span className="text-xs text-muted-foreground uppercase mb-1">HS %</span>
                  <span className="text-2xl font-bold text-purple-300">{playerData.stats.hs}%</span>
                </div>
                <div className="bg-[#111111] p-4 rounded-lg border border-purple-900/30 flex flex-col items-center justify-center text-center hover:border-purple-500/50 transition-colors">
                  <span className="text-xs text-muted-foreground uppercase mb-1">Наиграно часов</span>
                  <span className="text-2xl font-bold text-purple-300">{(playerData.stats.playtime / 60).toFixed(1)}</span>
                </div>
                <div className="bg-[#111111] p-4 rounded-lg border border-purple-900/30 flex flex-col items-center justify-center text-center hover:border-purple-500/50 transition-colors">
                  <span className="text-xs text-muted-foreground uppercase mb-1">Ранг</span>
                  <span className="text-2xl font-bold text-gradient-logo">#{playerData.stats.rank}</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Статистика пока недоступна — играйте на сервере!
              </div>
            )}
          </div>
        </>
      )}

      {/* Privileges Block */}
      <div className="mt-8 rounded-xl border border-purple-800 bg-[#1a1a1a] p-6 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-shadow animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <h2 className="text-2xl font-bold text-foreground mb-4">Мои привилегии</h2>
        {playerData?.vips && playerData.vips.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-purple-800">
            <table className="w-full text-left text-sm text-foreground">
              <thead className="bg-[#111111] text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-semibold border-b border-purple-800">Ваучер</th>
                  <th className="px-6 py-4 font-semibold border-b border-purple-800">Сервер</th>
                  <th className="px-6 py-4 font-semibold border-b border-purple-800">Активен до</th>
                  <th className="px-6 py-4 font-semibold border-b border-purple-800">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/40 bg-[#1a1a1a]">
                {playerData.vips.map((v, i) => {
                  const expireDate = v.expires_at ? new Date(v.expires_at) : (v.expires ? new Date(v.expires * 1000) : null);
                  const isExpired = expireDate ? expireDate.getTime() < Date.now() : false;
                  return (
                    <tr key={i} className="hover:bg-purple-900/10 transition-colors">
                      <td className="px-6 py-4 font-medium text-purple-300">{v.vip_group}</td>
                      <td className="px-6 py-4">RUH | CS2 Server</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {expireDate ? expireDate.toLocaleDateString() : 'Бессрочно'}
                      </td>
                      <td className="px-6 py-4">
                        {isExpired ? (
                          <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400 border border-red-500/20">
                            Истек
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400 border border-green-500/20">
                            Активен
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground bg-[#111111] rounded-xl border border-purple-900/40">
            Привилегий пока нет
          </div>
        )}
      </div>

      {/* Payment History Block */}
      <div className="mt-8 rounded-xl border border-purple-800 bg-[#1a1a1a] p-6 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-shadow animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <h2 className="text-2xl font-bold text-foreground mb-4">История платежей</h2>
        {playerData?.orders && playerData.orders.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-purple-800">
            <table className="w-full text-left text-sm text-foreground">
              <thead className="bg-[#111111] text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-semibold border-b border-purple-800">Дата</th>
                  <th className="px-6 py-4 font-semibold border-b border-purple-800">Ваучер</th>
                  <th className="px-6 py-4 font-semibold border-b border-purple-800">Сумма</th>
                  <th className="px-6 py-4 font-semibold border-b border-purple-800">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/40 bg-[#1a1a1a]">
                {playerData.orders.map((o) => {
                  const dateStr = new Date(o.created_at).toLocaleDateString();
                  return (
                    <tr key={o.id} className="hover:bg-purple-900/10 transition-colors">
                      <td className="px-6 py-4 text-muted-foreground">{dateStr}</td>
                      <td className="px-6 py-4 font-medium text-purple-300">{o.voucher}</td>
                      <td className="px-6 py-4 font-mono">{o.price.toLocaleString()} ₸</td>
                      <td className="px-6 py-4">
                        {o.status === 'approved' ? (
                          <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400 border border-green-500/20">
                            Оплачено
                          </span>
                        ) : o.status === 'pending' ? (
                          <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-400 border border-yellow-500/20">
                            В обработке
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400 border border-red-500/20">
                            Отклонено
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground bg-[#111111] rounded-xl border border-purple-900/40">
            История платежей пуста
          </div>
        )}
      </div>
    </div>
  );
}
