export interface SteamUser {
  steamid: string;
  personaname: string;
  avatarfull: string;
  avatar: string;
  avatarmedium: string;
  profileurl: string;
  personastate: number; // 0=Offline, 1=Online, 2=Busy, 3=Away, 4=Snooze, 5=Looking to trade, 6=Looking to play
  timecreated?: number | undefined;
  loccountrycode?: string | undefined;
  gameextrainfo?: string | undefined;
  communityvisibilitystate: number;
}

export interface SteamPlayerSummariesResponse {
  response: {
    players: SteamUser[];
  };
}

export const STEAM_PERSONA_STATES: Record<number, { label: string; color: string }> = {
  0: { label: "Оффлайн", color: "text-gray-400" },
  1: { label: "Онлайн", color: "text-green-400" },
  2: { label: "Занят", color: "text-red-400" },
  3: { label: "Отошёл", color: "text-yellow-400" },
  4: { label: "Спит", color: "text-blue-400" },
  5: { label: "Хочет обменяться", color: "text-cyan-400" },
  6: { label: "Хочет играть", color: "text-emerald-400" },
};
