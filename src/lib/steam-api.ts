import type { SteamUser } from "@/types";

export function getSiteUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return (import.meta.env["VITE_SITE_URL"] as string | undefined) ?? "http://localhost:8080";
}

/**
 * Build the Steam OpenID login URL.
 */
export function buildSteamLoginUrl(): string {
  const siteUrl = getSiteUrl();
  const returnTo = `${siteUrl}/auth/steam`;
  const params = new URLSearchParams({
    "openid.mode": "checkid_setup",
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.return_to": returnTo,
    "openid.realm": siteUrl,
  });
  return `https://steamcommunity.com/openid/login?${params.toString()}`;
}

/**
 * Parse SteamID64 from Steam OpenID claimed_id URL.
 * Example: https://steamcommunity.com/openid/id/76561198012345678
 */
export function parseSteamIdFromClaimedId(claimedId: string): string | null {
  const match = /\/openid\/id\/(\d+)$/.exec(claimedId);
  return match?.[1] ?? null;
}

/**
 * Parse SteamID64 from various input formats:
 * - Direct SteamID64: 76561198012345678
 * - Profile URL: https://steamcommunity.com/profiles/76561198012345678
 * - Custom URL (returns null — needs API resolve)
 */
export function parseSteamIdFromInput(input: string): string | null {
  const trimmed = input.trim();

  // Direct SteamID64
  if (/^\d{17}$/.test(trimmed)) {
    return trimmed;
  }

  // Profile URL with SteamID64
  const profileMatch = /steamcommunity\.com\/profiles\/(\d{17})/.exec(trimmed);
  if (profileMatch?.[1]) {
    return profileMatch[1];
  }

  return null;
}

/**
 * Fetch public Steam profile XML data without API key.
 * Tries multiple CORS proxies as fallback.
 */
export async function fetchPublicSteamProfile(steamId: string): Promise<SteamUser | null> {
  const profileXmlUrl = `https://steamcommunity.com/profiles/${steamId}/?xml=1`;

  const proxyUrls = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(profileXmlUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(profileXmlUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(profileXmlUrl)}`,
  ];

  for (const proxyUrl of proxyUrls) {
    try {
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const text = await res.text();
      if (!text.includes("<profile>")) continue;

      const parsed = parseSteamXml(text, steamId);
      if (parsed) return parsed;
    } catch {
      // Try next proxy
      continue;
    }
  }

  return null;
}

function parseSteamXml(text: string, steamId: string): SteamUser | null {
  const get = (tag: string): string | undefined => {
    const cdataRe = new RegExp(`<${tag}><!\\[CDATA\\[(.*?)\\]\\]></${tag}>`);
    const plainRe = new RegExp(`<${tag}>(.*?)</${tag}>`);
    return cdataRe.exec(text)?.[1] ?? plainRe.exec(text)?.[1];
  };

  const nickname = get("steamID");
  if (!nickname) return null;

  const avatarFull = get("avatarFull");
  const avatarMedium = get("avatarMedium");
  const avatarIcon = get("avatarIcon");

  const stateText = get("onlineState") ?? "";
  const personastate = stateText === "online" || stateText === "in-game" ? 1 : 0;

  const memberSince = get("memberSince");
  let timecreated: number | undefined;
  if (memberSince) {
    const parsed = Date.parse(memberSince);
    if (!isNaN(parsed)) timecreated = Math.floor(parsed / 1000);
  }

  const defaultAvatar = "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg";

  return {
    steamid: steamId,
    personaname: nickname,
    avatar: avatarIcon || defaultAvatar,
    avatarmedium: avatarMedium || defaultAvatar,
    avatarfull: avatarFull || defaultAvatar,
    profileurl: `https://steamcommunity.com/profiles/${steamId}/`,
    personastate,
    timecreated,
    communityvisibilitystate: 3,
  };
}

/**
 * Fetch Steam profile via playerdb.co — free API with CORS, no key needed.
 */
async function fetchSteamViaPlayerDb(steamId: string): Promise<SteamUser | null> {
  try {
    const url = `https://playerdb.co/api/player/steam/${steamId}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;

    const json = (await res.json()) as {
      success: boolean;
      data: {
        player: {
          meta: {
            steamID64: string;
            avatar: string;
            avatarfull: string;
            avatarmedium: string;
            username: string;
            personastate: number;
            timecreated: number;
            profileurl: string;
            loccountrycode?: string;
          };
        };
      };
    };

    if (!json.success) return null;

    const meta = json.data.player.meta;
    return {
      steamid: meta.steamID64 || steamId,
      personaname: meta.username,
      avatar: meta.avatar,
      avatarmedium: meta.avatarmedium,
      avatarfull: meta.avatarfull,
      profileurl: meta.profileurl || `https://steamcommunity.com/profiles/${steamId}/`,
      personastate: meta.personastate ?? 0,
      timecreated: meta.timecreated || undefined,
      loccountrycode: meta.loccountrycode || undefined,
      communityvisibilitystate: 3,
    };
  } catch {
    return null;
  }
}

const STEAM_API_KEY = import.meta.env["VITE_STEAM_API_KEY"] as string | undefined;

/**
 * Fetch Steam player summary via allorigins.win CORS proxy.
 */
export async function fetchSteamViaAllOrigins(steamId: string): Promise<SteamUser | null> {
  if (!STEAM_API_KEY || STEAM_API_KEY === "YOUR_STEAM_API_KEY") return null;

  try {
    const targetUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) return null;

    const json = (await res.json()) as { contents: string };
    const data = JSON.parse(json.contents) as {
      response?: { players?: SteamUser[] };
    };

    return data.response?.players?.[0] ?? null;
  } catch (error) {
    console.error("AllOrigins proxy fetch error:", error);
    return null;
  }
}

/**
 * Fetch Steam player summary by SteamID64.
 * Priority: 1) allorigins.win CORS proxy with VITE_STEAM_API_KEY, 2) playerdb.co, 3) XML proxy
 */
export async function getSteamPlayerSummary(steamId: string): Promise<SteamUser | null> {
  // 1. Try AllOrigins CORS proxy with VITE_STEAM_API_KEY
  const allOriginsResult = await fetchSteamViaAllOrigins(steamId);
  if (allOriginsResult) {
    return allOriginsResult;
  }

  // 2. Try server-side function (if available in SSR environment)
  try {
    const { fetchSteamUserServer } = await import("@/lib/steam-server");
    const serverResult = await fetchSteamUserServer({ data: steamId });
    if (serverResult) {
      return serverResult as SteamUser;
    }
  } catch {
    // Continue to next fallback
  }

  // 3. Try playerdb.co — free, reliable, has CORS headers
  const playerDbResult = await fetchSteamViaPlayerDb(steamId);
  if (playerDbResult) {
    return playerDbResult;
  }

  // 4. Try public Steam profile XML via CORS proxies
  const publicProfile = await fetchPublicSteamProfile(steamId);
  if (publicProfile) {
    return publicProfile;
  }

  return null;
}

/**
 * Mock Steam user data for development
 */
export function getMockSteamUser(steamId: string): SteamUser {
  const shortId = steamId.length >= 6 ? steamId.slice(-6) : steamId;
  const defaultAvatar = "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg";
  return {
    steamid: steamId,
    personaname: `Player_${shortId}`,
    avatar: defaultAvatar,
    avatarmedium: defaultAvatar,
    avatarfull: defaultAvatar,
    profileurl: `https://steamcommunity.com/profiles/${steamId}/`,
    personastate: 1,
    timecreated: 1577836800,
    loccountrycode: "RU",
    communityvisibilitystate: 3,
  };
}
