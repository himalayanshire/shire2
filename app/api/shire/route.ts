import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/shire/rate-limit";
import { buildSystemPrompt } from "@/lib/shire/prompt";
import { completeChat } from "@/lib/shire/provider";
import { answerFromKnowledge } from "@/lib/shire/fallback";
import { brand } from "@/lib/content";
import { shireRequestSchema, type ShireResponse } from "@/lib/shire/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Messages sent to the model (older turns are dropped to cap context). */
const MODEL_HISTORY = 8;

type ErrorCode = "not_configured" | "rate_limited" | "invalid" | "upstream" | "timeout" | "forbidden" | "busy";

function fail(code: ErrorCode, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: code, ...extra }, { status, headers: { "Cache-Control": "no-store" } });
}

/** Browsers always send Origin on cross-site POSTs; reject anything not from this site. */
function originAllowed(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const allowed = new Set<string>(["www.thehimalayanshire.com", "thehimalayanshire.com"]);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host) allowed.add(host);
  return allowed.has(originHost);
}

const DAY_MS = 86_400_000;

function isoToUtc(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y!, m! - 1, d!);
}

/**
 * Models sometimes pick a past year for "2 Jan". Any booking link whose check-in
 * is before today is moved forward by whole years (keeping the length of stay),
 * and impossible dates are reset to a one-night stay.
 */
function fixBookingDates(text: string): string {
  const todayIso = new Date().toISOString().slice(0, 10);
  const today = isoToUtc(todayIso);
  return text.replace(
    /checkin=(\d{4}-\d{2}-\d{2})&checkout=(\d{4}-\d{2}-\d{2})/g,
    (_match, cin: string, cout: string) => {
      let start = isoToUtc(cin);
      let end = isoToUtc(cout);
      if (Number.isNaN(start) || Number.isNaN(end)) return `checkin=${todayIso}&checkout=${todayIso}`;
      let nights = Math.round((end - start) / DAY_MS);
      if (nights < 1 || nights > 30) nights = 1;
      let guard = 0;
      while (start < today && guard++ < 5) {
        const d = new Date(start);
        d.setUTCFullYear(d.getUTCFullYear() + 1);
        start = d.getTime();
      }
      end = start + nights * DAY_MS;
      const fmt = (ms: number) => new Date(ms).toISOString().slice(0, 10);
      return `checkin=${fmt(start)}&checkout=${fmt(end)}`;
    },
  );
}

/** Plain text only: strip control characters, hidden reasoning blocks, and cap length. */
function cleanReply(text: string): string {
  return fixBookingDates(text)
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, 2000);
}

export async function POST(request: Request) {
  if (!originAllowed(request)) return fail("forbidden", 403);
  if (process.env.SHIRE_ENABLED === "false") return fail("not_configured", 503);

  const ip = getClientIp(request.headers);
  const burst = rateLimit({ key: "shire:burst", limit: 8, windowMs: 60_000, ip });
  const sustained = rateLimit({ key: "shire:hour", limit: 60, windowMs: 60 * 60_000, ip });
  if (!burst.success || !sustained.success) {
    return fail("rate_limited", 429, {
      retryAfterSeconds: Math.max(
        ...[burst, sustained].filter((r) => !r.success).map((r) => r.retryAfterSeconds),
      ),
    });
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 30_000) return fail("invalid", 413);
    body = JSON.parse(raw);
  } catch {
    return fail("invalid", 400);
  }
  const parsed = shireRequestSchema.safeParse(body);
  if (!parsed.success) return fail("invalid", 400);

  const { messages, path } = parsed.data;
  const result = await completeChat([
    { role: "system", content: buildSystemPrompt(path) },
    ...messages.slice(-MODEL_HISTORY).map((m) => ({ role: m.role, content: m.content })),
  ]);
  if (!result.ok) {
    // The free AI is busy or down: answer from the site's own FAQ/facts if we can.
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const offline = lastUser ? answerFromKnowledge(lastUser.content) : null;
    if (offline) {
      console.info("[shire] ok provider=offline-faq");
      const payload: ShireResponse = { reply: offline };
      return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
    }
    // Never leave the visitor with an error: hand over the team's contact details.
    console.info("[shire] ok provider=contact-fallback");
    const payload: ShireResponse = {
      reply: `I'm having trouble answering that right now, sorry! The team can help straight away: call or WhatsApp ${brand.phoneDisplay.join(" or ")}, or email ${brand.email}.`,
    };
    return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
  }

  const reply = cleanReply(result.text);
  if (!reply) return fail("upstream", 502);

  console.info(`[shire] ok provider=${result.endpoint}`);
  const payload: ShireResponse = { reply };
  return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } });
}

/** Anything but POST is not part of the API. */
export function GET() {
  return fail("invalid", 405);
}
