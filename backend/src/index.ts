import { handleAuth, requireUser } from "./auth";
import type { Env } from "./auth";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const authResponse = await handleAuth(request, env, url.pathname);
    if (authResponse) return authResponse;

    if (request.method === "GET" && url.pathname === "/api/admin/me") {
      const result = await requireUser(request, env, "admin");
      return result instanceof Response ? result : Response.json({ user: result });
    }

    if (request.method === "GET" && url.pathname === "/api/health") {
      return Response.json({ status: "ok" });
    }

    if (request.method === "GET" && url.pathname === "/api/health/db") {
      try {
        await env.DB.prepare("SELECT 1").first();
        return Response.json({ status: "ok", database: "connected" });
      } catch {
        return Response.json({ status: "error", database: "unavailable" }, { status: 503 });
      }
    }

    return Response.json({ error: "Not found" }, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
