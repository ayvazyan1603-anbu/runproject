export interface FaceitPlayer {
  player_id: string;
  nickname: string;
  avatar: string;
  country: string;
  cover_image: string;
  games: {
    cs2?: {
      faceit_elo: number;
      skill_level: number;
      region: string;
      game_player_id: string;
    };
  };
  faceit_url: string;
}

export interface FaceitMatch {
  match_id: string;
  game_id: string;
  started_at: number;
  finished_at: number;
  playing_players: string[];
  results: {
    winner: string;
    score: {
      faction1: number;
      faction2: number;
    };
  };
  teams: {
    faction1: {
      team_id: string;
      nickname: string;
      avatar: string;
      players: { player_id: string; nickname: string; avatar: string }[];
    };
    faction2: {
      team_id: string;
      nickname: string;
      avatar: string;
      players: { player_id: string; nickname: string; avatar: string }[];
    };
  };
  competition_name?: string | undefined;
  game_mode?: string | undefined;
  // Parsed fields added by our code
  map?: string | undefined;
  playerTeam?: "faction1" | "faction2" | undefined;
  isWin?: boolean | undefined;
  kd?: string | undefined;
}

export interface FaceitMatchHistory {
  items: FaceitMatch[];
  start: number;
  end: number;
}

export interface FaceitPlayerStats {
  player_id: string;
  game_id: string;
  lifetime: {
    "Average K/D Ratio": string;
    "Win Rate %": string;
    Matches: string;
    Wins: string;
    "Total Headshots %": string;
    "Average Headshots %": string;
    "Longest Win Streak": string;
    "Current Win Streak": string;
  };
  segments: FaceitSegment[];
}

export interface FaceitSegment {
  label: string;
  img_small: string;
  img_regular: string;
  stats: {
    "K/D Ratio": string;
    "Win Rate %": string;
    Matches: string;
    Wins: string;
    "Average Kills": string;
    "Average Deaths": string;
    "Average Headshots %": string;
    "Average K/R Ratio": string;
  };
  type: string;
  mode: string;
}

export interface FaceitLevelInfo {
  level: number;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  hasGlow: boolean;
}

export function getFaceitLevelInfo(level: number): FaceitLevelInfo {
  if (level >= 9) {
    return {
      level,
      color: "text-red-400",
      bgColor: "bg-red-500/20",
      borderColor: "border-red-500/60",
      glowColor: "shadow-[0_0_15px_rgba(239,68,68,0.5)]",
      hasGlow: true,
    };
  }
  if (level >= 7) {
    return {
      level,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
      borderColor: "border-orange-500/60",
      glowColor: "shadow-[0_0_12px_rgba(249,115,22,0.4)]",
      hasGlow: true,
    };
  }
  if (level >= 4) {
    return {
      level,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
      borderColor: "border-yellow-500/60",
      glowColor: "",
      hasGlow: false,
    };
  }
  return {
    level,
    color: "text-gray-400",
    bgColor: "bg-gray-500/20",
    borderColor: "border-gray-500/60",
    glowColor: "",
    hasGlow: false,
  };
}
