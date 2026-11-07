interface Env {
  DB: D1Database;
}

interface RegisterInput {
  email?: unknown;
  password?: unknown;
  displayName?: unknown;
}

function encodeBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const iterations = 310_000;
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256,
  );
  return `pbkdf2-sha256$${iterations}$${encodeBase64(salt)}$${encodeBase64(new Uint8Array(derived))}`;
}

async function register(request: Request, env: Env): Promise<Response> {
  let input: RegisterInput;
  try {
    input = await request.json() as RegisterInput;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = typeof input?.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = input?.password;
  const displayName = typeof input?.displayName === "string" ? input.displayName.trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 128) {
    return Response.json({ error: "Password must be 8 to 128 characters" }, { status: 400 });
  }
  if (!displayName || displayName.length > 100) {
    return Response.json({ error: "Invalid display name" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  try {
    await env.DB.prepare(
      "INSERT INTO users (id, email, password_hash, display_name, role) VALUES (?, ?, ?, ?, 'customer')",
    ).bind(id, email, passwordHash, displayName).run();
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed: users.email")) {
      return Response.json({ error: "Email already registered" }, { status: 409 });
    }
    throw error;
  }

  return Response.json({ id, email, displayName, role: "customer" }, { status: 201 });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/auth/register") {
      return register(request, env);
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
