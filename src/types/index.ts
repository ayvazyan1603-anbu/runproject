export interface GameMode {
  id: string;
  name: string;
  description: string;
  players: number;
  tag: string;
}

export interface Server {
  id: string;
  name: string;
  map: string;
  players: number;
  maxPlayers: number;
  status: "online" | "offline" | "restarting";
  ip: string;
}

export interface Benefit {
  id: string;
  label: string;
  /** "yes" | "no" render as icons, anything else renders as text */
  values: string[];
  accent?: "danger" | "gold";
}


export interface Privilege {
  id: string;
  name: string;
  price: number;
  features: string[];
  isPopular?: boolean;
  accent?: string;
}

export interface Skin {
  id: string;
  name: string;
  category: SkinCategory;
  rarity: "Обычный" | "Редкий" | "Легендарный";
}

export type SkinCategory = "ct" | "t" | "knives" | "characters";

export interface Player {
  id: string;
  rank: number;
  nickname: string;
  points: number;
  kills: number;
  deaths: number;
  kd: number;
  hours: number;
}

export type PunishmentType = "ban" | "mute" | "kick";

export interface Punishment {
  id: string;
  nickname: string;
  type: PunishmentType;
  reason: string;
  admin: string;
  date: string;
  duration: string;
}

export type TicketStatus = "open" | "pending" | "closed";

export interface Ticket {
  id: number;
  subject: string;
  status: TicketStatus;
  date: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export type { SteamUser, SteamPlayerSummariesResponse } from "./steam";
export { STEAM_PERSONA_STATES } from "./steam";
export type {
  FaceitPlayer,
  FaceitMatch,
  FaceitMatchHistory,
  FaceitPlayerStats,
  FaceitSegment,
  FaceitLevelInfo,
} from "./faceit";
export { getFaceitLevelInfo } from "./faceit";
