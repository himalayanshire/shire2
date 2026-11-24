/**
 * Free LLM provider client for Shire.
 *
 * Talks to OpenAI-compatible `/chat/completions` endpoints. With no
 * configuration it uses key-less public endpoints serving open-weight
 * GPT-OSS 20B (llm7.io, then Pollinations as a backup), so the assistant costs
 * nothing to run and needs no account or API key.
 *
 * Optional overrides (all server-side env vars):
 *   GROQ_API_KEY            → Groq's free tier (faster, more reliable)
 *   SHIRE_API_URL / _KEY / _MODEL → any other OpenAI-compatible host
 *   SHIRE_ENABLED=false     → switch the assistant off
 * When a key/URL is configured, visitor messages are sent only to that host.
 */

export type ChatTurn = { role: "system" | "user" | "assistant"; content: string };

type Endpoint = {
  name: string;
  chatUrl: string;
  model: string;
  apiKey?: string;
  maxTokens: number;
  /** Groq GPT-OSS accepts this; keeps replies fast. */
  lowReasoning?: boolean;
};

export type ProviderResult =
  | { ok: true; text: string; endpoint: string }
  | { ok: false; reason: "timeout" | "upstream" | "busy"; detail: string };

/** GPT-OSS reasons before answering, so leave token headroom for that. */
const FREE_ENDPOINTS: Endpoint[] = [
  { name: "llm7", chatUrl: "https://api.llm7.io/v1/chat/completions", model: "gpt-oss:20b", maxTokens: 1500 },
  { name: "pollinations", chatUrl: "https://text.pollinations.ai/openai", model: "openai-fast", maxTokens: 1500 },
  { name: "pollinations-2", chatUrl: "https://text.pollinations.ai/openai", model: "openai", maxTokens: 1500 },
];

const ATTEMPT_TIMEOUT_MS = 14_000;

function endpoints(): Endpoint[] {
  const customUrl = process.env.SHIRE_API_URL?.trim();
  if (customUrl) {
    const trimmed = customUrl.replace(/\/+$/, "");
    return [
      {
        name: "custom",
        chatUrl: /\/chat\/completions$/.test(trimmed) ? trimmed : `${trimmed}/chat/completions`,
        model: process.env.SHIRE_MODEL?.trim() || "gpt-oss:20b",
        apiKey: process.env.SHIRE_API_KEY?.trim() || undefined,
        maxTokens: 1200,
      },
    ];
  }
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey) {
    return [
      {
        name: "groq",
        chatUrl: "https://api.groq.com/openai/v1/chat/completions",
        model: process.env.SHIRE_MODEL?.trim() || "openai/gpt-oss-120b",
        apiKey: groqKey,
        maxTokens: 1200,
        lowReasoning: true,
      },
    ];
  }
  return FREE_ENDPOINTS;
}

async function attempt(endpoint: Endpoint, messages: ChatTurn[]): Promise<ProviderResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS);
  try {
    const response = await fetch(endpoint.chatUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        ...(endpoint.apiKey ? { authorization: `Bearer ${endpoint.apiKey}` } : null),
      },
      body: JSON.stringify({
        model: endpoint.model,
        messages,
        max_tokens: endpoint.maxTokens,
        temperature: 0.5,
        stream: false,
        ...(endpoint.lowReasoning ? { reasoning_effort: "low" } : null),
      }),
    });
    if (!response.ok) {
      const busy = [402, 429, 503].includes(response.status);
      return {
        ok: false,
        reason: busy ? "busy" : "upstream",
        detail: `${endpoint.name} HTTP ${response.status}`,
      };
    }
    const data = (await response.json()) as { choices?: { message?: { content?: string | null } }[] };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) return { ok: false, reason: "upstream", detail: `${endpoint.name} empty reply` };
    return { ok: true, text, endpoint: endpoint.name };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { ok: false, reason: "timeout", detail: `${endpoint.name} timeout` };
    }
    return { ok: false, reason: "upstream", detail: `${endpoint.name} unreachable` };
  } finally {
    clearTimeout(timer);
  }
}

/** Tries each endpoint in order until one answers. Logs status only, never message content. */
export async function completeChat(messages: ChatTurn[]): Promise<ProviderResult> {
  let last: ProviderResult = { ok: false, reason: "upstream", detail: "no endpoint configured" };
  let sawBusy = false;
  // Free tiers rate-limit per IP in short bursts: if every endpoint is busy,
  // wait briefly and make one more pass before giving up.
  const started = Date.now();
  for (let round = 0; round < 3; round++) {
    sawBusy = false;
    for (const endpoint of endpoints()) {
      const result = await attempt(endpoint, messages);
      if (result.ok) return result;
      console.error(`[shire] ${result.detail}`);
      if (result.reason === "busy") sawBusy = true;
      last = result;
      if (Date.now() - started > 40_000) return sawBusy ? { ok: false, reason: "busy", detail: result.detail } : result;
    }
    if (round < 2) await new Promise((r) => setTimeout(r, 1500));
  }
  return sawBusy ? { ok: false, reason: "busy", detail: last.ok ? "" : last.detail } : last;
}
