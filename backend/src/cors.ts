import type { Env } from "./auth";

export function isAllowedOrigin(origin: string | null, request: Request, env?: Env): boolean {
  if (!origin) return true;
  if (origin === new URL(request.url).origin) return true;

  if (env?.ALLOWED_ORIGIN) {
    const allowedList = env.ALLOWED_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean);
    if (allowedList.includes(origin) || allowedList.includes("*")) return true;
  }

  try {
    const parsed = new URL(origin);
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      return true;
    }
    if (parsed.protocol === "https:" && parsed.hostname.endsWith(".pages.dev")) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export function buildCorsHeaders(request: Request, env?: Env): Record<string, string> {
  const origin = request.headers.get("Origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };

  if (origin && isAllowedOrigin(origin, request, env)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  } else if (!origin) {
    headers["Access-Control-Allow-Origin"] = "*";
  }

  return headers;
}

export function withCors(response: Response, request: Request, env?: Env): Response {
  const cors = buildCorsHeaders(request, env);
  const newHeaders = new Headers(response.headers);
  for (const [key, value] of Object.entries(cors)) {
    if (key === "Vary") {
      const existing = newHeaders.get("Vary");
      if (!existing) {
        newHeaders.set("Vary", value);
      } else if (!existing.split(",").map((v) => v.trim().toLowerCase()).includes("origin")) {
        newHeaders.set("Vary", `${existing}, Origin`);
      }
    } else {
      newHeaders.set(key, value);
    }
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
