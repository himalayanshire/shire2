"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { ArrowUp, CalendarCheck, Loader2, Phone, RotateCcw, X } from "lucide-react";
import { brand } from "@/lib/content";
import { property } from "@/lib/property";
import { SHIRE_LIMITS, type ShireResponse } from "@/lib/shire/types";
import { ShireIcon } from "./ShireIcon";
import { ShireMarkdown } from "./ShireMarkdown";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Local greeting — shown to the visitor but never sent to the model. */
  local?: boolean;
};

type Failure = { kind: "busy" | "rate_limited" | "network" | "upstream"; retryAfter?: number };

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  local: true,
  content: "Hi, I'm **Shire**! How can I help you?\n\nAsk me anything about The Himalayan Shire or your stay in Fagu.",
};

const STARTERS = [
  "What rooms do you have?",
  "Is it pet friendly?",
  "How do I book?",
  "How far is Shimla?",
  "Will it snow?",
];

const STORAGE_KEY = "shire:chat";
const WHATSAPP_PREFILL = "Hi! I have a question about The Himalayan Shire.";

const uid = () => Math.random().toString(36).slice(2, 10);

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function ShirePanel({ onClose, path }: { onClose: () => void; path: string }) {
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Storage unavailable or corrupt — start fresh.
    }
    return [WELCOME];
  });
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [failure, setFailure] = React.useState<Failure | null>(null);
  const [viewportHeight, setViewportHeight] = React.useState<number | null>(null);

  // Synchronous mirror of `messages` so an async send always sees the latest history.
  const latest = React.useRef(messages);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const abortRef = React.useRef<AbortController | null>(null);
  const inFlight = React.useRef(false);
  const coarsePointer = React.useRef(false);

  React.useEffect(() => {
    coarsePointer.current = window.matchMedia("(pointer: coarse)").matches;
    inputRef.current?.focus({ preventScroll: true });
    return () => abortRef.current?.abort();
  }, []);

  // Keep the sheet inside the visible viewport when the mobile keyboard opens.
  React.useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const sync = () => setViewportHeight(Math.round(vv.height));
    sync();
    vv.addEventListener("resize", sync);
    return () => vv.removeEventListener("resize", sync);
  }, []);

  // Conversation lives for this tab only (sessionStorage); it is never stored on a server.
  React.useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      // ignore quota / privacy-mode errors
    }
  }, [messages]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading, failure]);

  const send = React.useCallback(
    async (text: string, opts?: { retry?: boolean }) => {
      const content = text.trim().slice(0, SHIRE_LIMITS.messageChars);
      if (!content || inFlight.current) return;
      inFlight.current = true;
      setFailure(null);

      // A retry re-sends the existing last user message instead of duplicating it.
      const history: ChatMessage[] = opts?.retry
        ? latest.current
        : [...latest.current, { id: uid(), role: "user", content }];
      latest.current = history;
      setMessages(history);
      if (!opts?.retry) setInput("");
      setLoading(true);

      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const response = await fetch("/api/shire", {
          method: "POST",
          headers: { "content-type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            path,
            messages: history
              .filter((m) => !m.local)
              .slice(-SHIRE_LIMITS.historyMessages)
              .map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        if (!response.ok) {
          const body = (await response.json().catch(() => ({}))) as { error?: string; retryAfterSeconds?: number };
          if (body.error === "busy") setFailure({ kind: "busy" });
          else if (body.error === "rate_limited") setFailure({ kind: "rate_limited", retryAfter: body.retryAfterSeconds });
          else setFailure({ kind: "upstream" });
          return;
        }
        const data = (await response.json()) as ShireResponse;
        const next: ChatMessage[] = [...latest.current, { id: uid(), role: "assistant", content: data.reply }];
        latest.current = next;
        setMessages(next);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setFailure({ kind: "network" });
      } finally {
        inFlight.current = false;
        setLoading(false);
      }
    },
    [path],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !coarsePointer.current && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send(input);
    }
  };

  const showStarters = messages.length === 1 && messages[0]?.local;
  const nearLimit = input.length > SHIRE_LIMITS.messageChars * 0.85;
  const waHref = `${brand.whatsapp}?text=${encodeURIComponent(WHATSAPP_PREFILL)}`;

  const chip =
    "inline-flex h-8 items-center gap-1.5 rounded-full border border-emerald-900/15 bg-white px-3 text-xs font-semibold text-emerald-950 transition-colors hover:border-emerald-900/40 hover:bg-emerald-50";

  return (
    <div
      role="dialog"
      aria-label="Shire, your assistant at The Himalayan Shire"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
      }}
      style={viewportHeight ? { height: `min(${viewportHeight}px, var(--shire-h))` } : undefined}
      className="fixed inset-x-0 bottom-0 top-auto z-[70] flex h-dvh flex-col overflow-hidden bg-[#fffdf7] text-emerald-950 shadow-2xl [--shire-h:100dvh] sm:inset-x-auto sm:bottom-[5.75rem] sm:right-6 sm:h-[min(36rem,calc(100dvh-7.5rem))] sm:w-[24.5rem] sm:rounded-3xl sm:border sm:border-emerald-900/15 sm:[--shire-h:36rem]"
    >
      {/* Header */}
      <header className="flex items-center gap-3 bg-[#0C2A1A] px-4 py-3.5 pt-[calc(0.875rem+env(safe-area-inset-top))] text-white sm:pt-3.5">
        <ShireIcon className="size-10 shrink-0 ring-2 ring-[#d4a62a]/70 rounded-full" />
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold leading-none text-white">Shire</p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-white/75">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-[#4ade80]" />
            Ask me anything
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="grid size-10 place-items-center rounded-full text-white/85 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </header>

      {/* Conversation */}
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Conversation with Shire"
        className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-[#f6f1e6] px-4 py-5"
      >
        {messages.map((message) =>
          message.role === "user" ? (
            <div key={message.id} className="flex justify-end">
              <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-emerald-800 px-4 py-2.5 text-[0.9375rem] leading-relaxed text-white">
                {message.content}
              </p>
            </div>
          ) : (
            <div key={message.id} className="flex gap-2.5">
              <ShireIcon className="mt-0.5 size-7 shrink-0" />
              <div className="min-w-0 max-w-[88%] break-words rounded-2xl rounded-tl-md border border-emerald-900/10 bg-white px-4 py-3">
                <ShireMarkdown text={message.content} onNavigate={onClose} />
              </div>
            </div>
          ),
        )}

        {showStarters ? (
          <div className="flex flex-wrap gap-2 pl-9">
            {STARTERS.map((starter) => (
              <button
                key={starter}
                type="button"
                onClick={() => void send(starter)}
                disabled={loading}
                className="min-h-9 rounded-full border border-emerald-900/20 bg-white px-3.5 text-left text-sm font-medium transition-colors hover:border-emerald-900/50 hover:bg-emerald-50 disabled:opacity-50"
              >
                {starter}
              </button>
            ))}
          </div>
        ) : null}

        {loading ? (
          <div className="flex gap-2.5" role="status" aria-label="Shire is typing">
            <ShireIcon className="mt-0.5 size-7 shrink-0" />
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-emerald-900/10 bg-white px-4 py-3.5">
              <span className="size-1.5 animate-bounce rounded-full bg-emerald-700/70" />
              <span className="size-1.5 animate-bounce rounded-full bg-emerald-700/70 [animation-delay:150ms]" />
              <span className="size-1.5 animate-bounce rounded-full bg-emerald-700/70 [animation-delay:300ms]" />
            </div>
          </div>
        ) : null}

        {failure ? (
          <div role="alert" className="rounded-2xl border border-emerald-900/20 bg-white p-4 text-sm">
            <p className="font-semibold">
              {failure.kind === "busy"
                ? "Shire is very busy right now."
                : failure.kind === "rate_limited"
                  ? "You're sending messages quickly."
                  : "Shire couldn't answer just now."}
            </p>
            <p className="mt-1 text-emerald-950/70">
              {failure.kind === "busy"
                ? "Give it a minute and try again, or message the team directly."
                : failure.kind === "rate_limited"
                  ? `Please wait${failure.retryAfter ? ` about ${failure.retryAfter} seconds` : " a moment"} and try again.`
                  : failure.kind === "network"
                    ? "Check your connection and try again."
                    : "Please try again, or reach the team directly."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const lastUser = [...latest.current].reverse().find((m) => m.role === "user");
                  if (lastUser) void send(lastUser.content, { retry: true });
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-emerald-800 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <RotateCcw aria-hidden="true" className="size-3.5" />
                Try again
              </button>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-emerald-900/25 px-4 text-sm font-semibold"
              >
                <WhatsAppGlyph className="size-3.5 text-[#128c7e]" />
                WhatsApp the team
              </a>
            </div>
          </div>
        ) : null}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="border-t border-emerald-900/10 bg-white px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3"
      >
        <div className="mb-2.5 flex flex-wrap gap-2">
          <a href={waHref} target="_blank" rel="noopener noreferrer" className={chip}>
            <WhatsAppGlyph className="size-3.5 text-[#128c7e]" />
            WhatsApp
          </a>
          <a href={brand.phoneHref[0]} className={chip}>
            <Phone aria-hidden="true" className="size-3.5" />
            Call
          </a>
          <a href={property.bookingUrl} target="_blank" rel="noopener noreferrer" className={chip}>
            <CalendarCheck aria-hidden="true" className="size-3.5" />
            Book
          </a>
        </div>
        <label htmlFor="shire-input" className="sr-only">
          Message Shire
        </label>
        <div className="flex items-end gap-2">
          <textarea
            id="shire-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, SHIRE_LIMITS.messageChars))}
            onKeyDown={onKeyDown}
            rows={1}
            maxLength={SHIRE_LIMITS.messageChars}
            placeholder="Ask me anything…"
            disabled={loading}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-emerald-900/20 bg-[#fffdf7] px-3.5 py-2.5 text-base leading-snug placeholder:text-emerald-950/45 focus:border-emerald-800 focus:outline-none disabled:opacity-60 sm:text-[0.9375rem]"
            style={{ fieldSizing: "content" } as React.CSSProperties}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-emerald-800 text-white transition-colors hover:bg-emerald-700 disabled:opacity-40"
          >
            {loading ? <Loader2 aria-hidden="true" className="size-5 animate-spin" /> : <ArrowUp aria-hidden="true" className="size-5" />}
          </button>
        </div>
        <p className="mt-2 flex items-center justify-between gap-3 text-[0.6875rem] leading-snug text-emerald-950/60">
          <span>AI can make mistakes. Confirm rates &amp; availability with the team. Don&apos;t share passwords or payment details.</span>
          {nearLimit ? (
            <span className="shrink-0 tabular-nums">
              {input.length}/{SHIRE_LIMITS.messageChars}
            </span>
          ) : null}
        </p>
      </form>
    </div>
  );
}

/** Floating "Shire" launcher (bottom-right) and its chat panel. */
export function ShireChat() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [everOpened, setEverOpened] = React.useState(false);
  const launcherRef = React.useRef<HTMLButtonElement>(null);

  const toggle = () => {
    setEverOpened(true);
    setOpen((v) => !v);
  };

  const close = React.useCallback(() => {
    setOpen(false);
    window.setTimeout(() => launcherRef.current?.focus(), 0);
  }, []);

  // On phones the chat is a full-screen sheet; stop the page scrolling behind it.
  React.useEffect(() => {
    if (!open || !window.matchMedia("(max-width: 639px)").matches) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      {/* Mounted after the first open so conversation state survives closing the panel. */}
      {everOpened ? (
        <div hidden={!open}>
          <ShirePanel onClose={close} path={pathname ?? "/"} />
        </div>
      ) : null}

      <button
        ref={launcherRef}
        type="button"
        onClick={toggle}
        aria-label={open ? "Close chat with Shire" : "Chat with Shire"}
        aria-expanded={open}
        className="pointer-events-auto fixed bottom-4 right-4 z-40 inline-flex h-14 items-center gap-2.5 rounded-full bg-[#0C2A1A] pl-1.5 pr-1.5 text-white shadow-lg ring-2 ring-[#d4a62a]/80 transition-all duration-300 hover:scale-105 hover:bg-emerald-950 sm:bottom-6 sm:right-6 sm:pr-5"
      >
        <ShireIcon className="size-11 shrink-0" />
        <span className="hidden text-sm font-bold tracking-wide sm:inline">Ask Shire</span>
      </button>
    </>
  );
}
