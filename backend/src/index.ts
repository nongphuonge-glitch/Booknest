import { handleAuth, requireUser } from "./auth";
import { getCategories, getBooks, getBookDetail, getAdminBooks, createAdminBook, updateAdminBook } from "./books";
import { createOrder } from "./orders";
import type { Env } from "./auth";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const authResponse = await handleAuth(request, env, url.pathname);
    if (authResponse) return authResponse;

    if (request.method === "GET" && url.pathname === "/api/categories") {
      return getCategories(env);
    }

    if (request.method === "GET" && url.pathname === "/api/books") {
      return getBooks(request, env);
    }

    if (request.method === "GET" && url.pathname.startsWith("/api/books/")) {
      const id = decodeURIComponent(url.pathname.replace("/api/books/", "").trim());
      if (id) return getBookDetail(env, id);
    }

    // Orders APIs (US07, BR04, BR05)
    if (request.method === "POST" && url.pathname === "/api/orders") {
      return createOrder(request, env);
    }

    // Admin Books & Inventory APIs (US05, US06, BR02, BR04)
    if (url.pathname === "/api/admin/books") {
      const auth = await requireUser(request, env, "admin");
      if (auth instanceof Response) return auth;
      if (request.method === "GET") return getAdminBooks(env);
      if (request.method === "POST") return createAdminBook(request, env);
    }

    if (url.pathname.startsWith("/api/admin/books/")) {
      const auth = await requireUser(request, env, "admin");
      if (auth instanceof Response) return auth;
      const id = decodeURIComponent(url.pathname.replace("/api/admin/books/", "").trim());
      if (id && request.method === "PATCH") return updateAdminBook(request, env, id);
    }

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
