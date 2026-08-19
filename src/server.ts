import "./lib/error-capture";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      
      if (response.status >= 500) {
        const body = await response.clone().text();
        console.error("SSR ERROR RESPONSE:", response.status, body);
      }
      
      return response;
    } catch (error) {
      console.error("SSR CATCH ERROR:", error);
      return new Response(JSON.stringify({ error: String(error), stack: (error as Error)?.stack }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }
  },
};
