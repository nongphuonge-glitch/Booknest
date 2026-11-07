export interface Env {
  DB: D1Database;
}

interface Credentials {
  email?: unknown;
  password?: unknown;
  displayName?: unknown;
}

interface UserRow {
  id: string;
  email: string;
  display_name: string;
  role: "customer" | "admin";
  password_hash: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  displayName: string;
  role: "customer" | "admin";
}

const SESSION_COOKIE = "booknest_session";
const SESSION_DAYS = 7;
const PASSWORD_ITERATIONS = 310_000;

function encodeBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function decodeBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function derivePassword(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"],
  );
  return new Uint8Array(await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256,
  ));
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePassword(password, salt, PASSWORD_ITERATIONS);
  return `pbkdf2-sha256$${PASSWORD_ITERATIONS}$${encodeBase64(salt)}$${encodeBase64(hash)}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, iterationText, saltText, hashText] = stored.split("$");
  if (algorithm !== "pbkdf2-sha256" || !/^\d+$/.test(iterationText)) return false;
  const iterations = Number(iterationText);
  if (iterations < 1 || iterations > 1_000_000) return false;
  try {
    const expected = decodeBase64(hashText);
    const actual = await derivePassword(password, decodeBase64(saltText), iterations);
    if (expected.length !== actual.length) return false;
    let difference = 0;
    for (let index = 0; index < actual.length; index++) difference |= actual[index] ^ expected[index];
    return difference === 0;
  } catch {
    return false;
  }
}

async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function cookieValue(request: Request): string | null {
  const pair = request.headers.get("Cookie")?.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  const value = pair?.slice(SESSION_COOKIE.length + 1);
  return value && /^[A-Za-z0-9_-]{43}$/.test(value) ? value : null;
}

function sessionCookie(token: string, request: Request, maxAge: number): string {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("Origin");
  return !origin || origin === new URL(request.url).origin;
}

async function readCredentials(request: Request): Promise<Credentials | null> {
  try {
    const input: unknown = await request.json();
    return input !== null && typeof input === "object" && !Array.isArray(input)
      ? input as Credentials : null;
  } catch {
    return null;
  }
}

function publicUser(row: UserRow): CurrentUser {
  return { id: row.id, email: row.email, displayName: row.display_name, role: row.role };
}

async function register(request: Request, env: Env): Promise<Response> {
  const input = await readCredentials(request);
  if (!input) return Response.json({ error: "Invalid JSON" }, { status: 400 });

  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = input.password;
  const displayName = typeof input.displayName === "string" ? input.displayName.trim() : "";
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

async function login(request: Request, env: Env): Promise<Response> {
  const input = await readCredentials(request);
  if (!input || typeof input.email !== "string" || typeof input.password !== "string") {
    return Response.json({ error: "Email and password required" }, { status: 400 });
  }
  const email = input.email.trim().toLowerCase();
  if (!email || email.length > 254 || input.password.length > 128) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const user = await env.DB.prepare(
    "SELECT id, email, display_name, role, password_hash FROM users WHERE email = ?",
  ).bind(email).first<UserRow>();
  if (!user || !await verifyPassword(input.password, user.password_hash)) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = encodeBase64(crypto.getRandomValues(new Uint8Array(32)))
    .replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000).toISOString();
  await env.DB.prepare(
    "INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)",
  ).bind(crypto.randomUUID(), user.id, await hashToken(token), expiresAt).run();
  const response = Response.json({ user: publicUser(user) });
  response.headers.set("Set-Cookie", sessionCookie(token, request, SESSION_DAYS * 86400));
  return response;
}

export async function requireUser(request: Request, env: Env, role?: "admin"): Promise<CurrentUser | Response> {
  const token = cookieValue(request);
  if (!token) return Response.json({ error: "Authentication required" }, { status: 401 });
  const user = await env.DB.prepare(`
    SELECT u.id, u.email, u.display_name, u.role
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > ?
  `).bind(await hashToken(token), new Date().toISOString()).first<UserRow>();
  if (!user) return Response.json({ error: "Authentication required" }, { status: 401 });
  if (role && user.role !== role) return Response.json({ error: "Forbidden" }, { status: 403 });
  return publicUser(user);
}

async function logout(request: Request, env: Env): Promise<Response> {
  const token = cookieValue(request);
  if (!token) return Response.json({ error: "Authentication required" }, { status: 401 });
  const now = new Date().toISOString();
  const result = await env.DB.prepare(`
    UPDATE sessions SET revoked_at = ?
    WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > ?
  `).bind(now, await hashToken(token), now).run();
  if (!result.meta.changes) return Response.json({ error: "Authentication required" }, { status: 401 });
  const response = Response.json({ status: "logged_out" });
  response.headers.set("Set-Cookie", sessionCookie("", request, 0));
  return response;
}

export async function handleAuth(request: Request, env: Env, path: string): Promise<Response | null> {
  if (request.method === "POST" && ["/api/auth/register", "/api/auth/login", "/api/auth/logout"].includes(path)) {
    if (!sameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
    if (path === "/api/auth/register") return register(request, env);
    if (path === "/api/auth/login") return login(request, env);
    return logout(request, env);
  }
  if (request.method === "GET" && path === "/api/auth/me") {
    const result = await requireUser(request, env);
    return result instanceof Response ? result : Response.json({ user: result });
  }
  return null;
}
