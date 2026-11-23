import * as React from "react";
import Link from "next/link";

/**
 * Renders Shire's replies without ever touching innerHTML. Supported subset:
 * paragraphs, "- " bullets, "1. " lists, **bold** and [label](/internal-path)
 * links, plus the official booking page link. Anything else is shown as literal
 * text, so model output cannot inject markup, scripts or other external links.
 */

/**
 * The one external link allowed: the official booking page, optionally with
 * dates and guest counts. Matched strictly, so nothing else can be smuggled in.
 */
const BOOKING_LINK =
  "https:\\/\\/letsbook\\.me\\/booking\\/thehimalayanshire(?:\\?checkin=\\d{4}-\\d{2}-\\d{2}&checkout=\\d{4}-\\d{2}-\\d{2}&adults=\\d{1,2}&children=\\d{1,2})?";
const TOKEN = new RegExp(`(\\*\\*[^*]+\\*\\*|\\[[^\\]]{1,80}\\]\\((?:\\/[^\\s)]{0,160}|${BOOKING_LINK})\\))`, "g");
const BOOKING_ONLY = new RegExp(`^${BOOKING_LINK}$`);

function renderInline(text: string, onNavigate?: () => void): React.ReactNode[] {
  return text.split(TOKEN).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    const external = /^\[([^\]]+)\]\((https:[^\s)]+)\)$/.exec(part);
    if (external?.[1] && external[2] && BOOKING_ONLY.test(external[2])) {
      return (
        <a
          key={index}
          href={external[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-emerald-800 underline decoration-[#d4a62a] decoration-2 underline-offset-2 hover:text-emerald-950"
        >
          {external[1]}
        </a>
      );
    }
    const link = /^\[([^\]]+)\]\((\/[^\s)]*)\)$/.exec(part);
    if (link?.[1] && link[2]) {
      return (
        <Link
          key={index}
          href={link[2]}
          onClick={onNavigate}
          className="font-semibold text-emerald-800 underline decoration-[#d4a62a] decoration-2 underline-offset-2 hover:text-emerald-950"
        >
          {link[1]}
        </Link>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

type Block = { kind: "p"; text: string } | { kind: "ul" | "ol"; items: string[] };

function parse(source: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: { kind: "ul" | "ol"; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ kind: "p", text: paragraph.join(" ") });
    paragraph = [];
  };
  const flushList = () => {
    if (list) blocks.push(list);
    list = null;
  };

  for (const rawLine of source.split("\n")) {
    const line = rawLine.trim();
    const bullet = /^[-*•]\s+(.*)$/.exec(line);
    const numbered = /^\d{1,2}[.)]\s+(.*)$/.exec(line);
    if (!line) {
      flushParagraph();
      flushList();
    } else if (bullet?.[1] !== undefined) {
      flushParagraph();
      if (list?.kind !== "ul") {
        flushList();
        list = { kind: "ul", items: [] };
      }
      list.items.push(bullet[1]);
    } else if (numbered?.[1] !== undefined) {
      flushParagraph();
      if (list?.kind !== "ol") {
        flushList();
        list = { kind: "ol", items: [] };
      }
      list.items.push(numbered[1]);
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  return blocks;
}

export function ShireMarkdown({ text, onNavigate }: { text: string; onNavigate?: () => void }) {
  const blocks = React.useMemo(() => parse(text), [text]);
  return (
    <div className="space-y-2.5 text-[0.9375rem] leading-relaxed">
      {blocks.map((block, index) => {
        if (block.kind === "p") return <p key={index}>{renderInline(block.text, onNavigate)}</p>;
        const Tag = block.kind === "ul" ? "ul" : "ol";
        return (
          <Tag
            key={index}
            className={
              block.kind === "ul"
                ? "list-disc space-y-1 pl-5 marker:text-[#d4a62a]"
                : "list-decimal space-y-1 pl-5 marker:font-semibold marker:text-emerald-800"
            }
          >
            {block.items.map((item, i) => (
              <li key={i}>{renderInline(item, onNavigate)}</li>
            ))}
          </Tag>
        );
      })}
    </div>
  );
}
