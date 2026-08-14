import { createServerFn } from "@tanstack/react-start";
import type { SteamUser } from "@/types";

/**
 * Server function to fetch Steam player summary.
 * Runs on the server — STEAM_API_KEY is never exposed to the browser.
 */
export const fetchSteamUserServer = createServerFn({ method: "GET" })
  .validator((steamId: string) => {
    if (!steamId || !/^\d{17}$/.test(steamId)) {
      throw new Error("Invalid SteamID64");
    }
    return steamId;
  })
  .handler(async ({ data: steamId }) => {
    const apiKey = process.env["STEAM_API_KEY"];

    if (!apiKey || apiKey === "YOUR_STEAM_API_KEY") {
      return null;
    }

    try {
      const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`;
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Steam API returned ${response.status.toString()}`);
        return null;
      }

      const data = (await response.json()) as {
        response: { players: SteamUser[] };
      };

      return data.response.players[0] ?? null;
    } catch (error) {
      console.error("Server: Failed to fetch Steam player summary:", error);
      return null;
    }
  });
