export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ForwardBody {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

const ALLOWED_ROLES: ChatRole[] = ["system", "user", "assistant"];

function validateBody(body: unknown): body is ForwardBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  if (!Array.isArray(b.messages) || b.messages.length === 0) return false;
  if (b.messages.length > 32) return false;
  for (const m of b.messages) {
    if (!m || typeof m !== "object") return false;
    const msg = m as Record<string, unknown>;
    if (typeof msg.content !== "string") return false;
    if (msg.content.length > 120_000) return false;
    if (!ALLOWED_ROLES.includes(msg.role as ChatRole)) return false;
  }
  if (b.temperature !== undefined && typeof b.temperature !== "number") return false;
  if (b.max_tokens !== undefined && typeof b.max_tokens !== "number") return false;
  return true;
}

/**
 * Server-only: calls DeepSeek using env vars (never VITE_*).
 * `env` can be overridden (e.g. Vite dev merges loadEnv into a copy).
 */
export async function forwardToDeepSeek(
  body: unknown,
  env: NodeJS.ProcessEnv = process.env,
): Promise<
  | { ok: true; data: unknown }
  | { ok: false; status: number; error: string }
> {
  if (!validateBody(body)) {
    return { ok: false, status: 400, error: "Invalid request body" };
  }

  const rawKey = env.DEEPSEEK_API_KEY;
  const apiKey =
    typeof rawKey === "string"
      ? rawKey.trim().replace(/^["']|["']$/g, "")
      : undefined;
  if (!apiKey || apiKey === "sk-1234567890abcdef") {
    return {
      ok: false,
      status: 503,
      error:
        "DEEPSEEK_API_KEY is not configured on the server. Add it in Vercel (or .env for local dev).",
    };
  }

  const baseUrl = (env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1").replace(
    /\/$/,
    "",
  );
  const model = env.DEEPSEEK_MODEL || "deepseek-chat";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: body.temperature ?? 0.3,
      max_tokens: body.max_tokens ?? 4000,
      messages: body.messages,
    }),
  });

  const data: unknown = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error?: { message?: string } }).error?.message === "string"
        ? (data as { error: { message: string } }).error.message
        : response.statusText;
    return { ok: false, status: response.status, error: msg };
  }

  return { ok: true, data };
}
