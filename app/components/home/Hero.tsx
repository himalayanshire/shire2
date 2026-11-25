"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { hero } from "@/lib/content";
import type { ReactNode } from "react";

const MAPS_URL =
  "https://www.google.com/maps?ll=31.066671,77.309332&z=13&t=m&hl=en&gl=IN&mapclient=embed&cid=4674173627328913394";

export function Hero({ content }: { content?: any }) {
  const ref = useRef<HTMLElement>(null);
  const data = { ...hero, ...(content?.hero ?? {}) };
  const videoUrl = typeof data.videoUrl === "string" && data.videoUrl.trim()
    ? data.videoUrl
    : hero.videoUrl;
  const poster = typeof data.poster === "string" && data.poster.trim()
    ? data.poster
    : hero.poster;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);

  const restMeta = (Array.isArray(data.meta) ? data.meta : [])
    .filter((m: any) => !/location/i.test(m.label) && !/kalpa/i.test(m.value))
    .map((m: any) =>
      /capacit|room/i.test(m.label) ? { ...m, value: "7 Rooms" } : m
    );

  const metaItems = [
    {
      label: "Location",
      value: "Fagu (Himachal Pradesh)",
      href: MAPS_URL,
      icon: "pin" as const,
    },
    ...restMeta.map((m: any) => ({ ...m, icon: iconFor(m.label) })),
  ];

  return (
    <section
      ref={ref}
      id="top"
      className="relative h-[70vh] min-h-[480px] w-full overflow-hidden bg-pine-100 max-sm:aspect-[128/125] max-sm:h-auto max-sm:min-h-0 sm:h-[80vh] sm:min-h-[560px] lg:h-[92vh]"
    >
      {/*
        Full-bleed cinematic video frame — edge to edge on every screen
        size, no frame, no rounding, no border.
      */}
      <div className="absolute inset-0">
        <motion.div
          style={{ y }}
          className="absolute inset-0 overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {/* Poster is the page's LCP candidate (hero fills the first
                viewport before the video starts). Preload it so the browser
                discovers it without waiting for the <video> markup; React
                hoists this <link> into <head>. */}
            <link rel="preload" as="image" href={poster} fetchPriority="high" />
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster={poster}
              className="absolute inset-0 h-full w-full object-cover object-center"
              aria-hidden="true"
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          </motion.div>

          {/* Cinematic dark overlay */}
          <div className="absolute inset-0 hero-overlay pointer-events-none" />

          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at center, transparent 55%, rgba(8,18,18,0.35) 100%)",
            }}
            aria-hidden
          />
        </motion.div>
      </div>

      {/* Fine gold inset frame — desktop only, frames the film like a lens */}
      <motion.div
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute inset-5 z-[6] hidden border border-gold-300/30 lg:block xl:inset-7"
        aria-hidden
      >
        <span className="absolute -left-px -top-px h-5 w-5 border-l-2 border-t-2 border-gold-300/80" />
        <span className="absolute -right-px -top-px h-5 w-5 border-r-2 border-t-2 border-gold-300/80" />
        <span className="absolute -left-px -bottom-px h-5 w-5 border-b-2 border-l-2 border-gold-300/80" />
        <span className="absolute -bottom-px -right-px h-5 w-5 border-b-2 border-r-2 border-gold-300/80" />
      </motion.div>

      {/* Scroll cue — a small mouse glyph, no text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="pointer-events-none absolute bottom-24 left-1/2 z-[7] hidden -translate-x-1/2 sm:bottom-28 md:block lg:bottom-32"
        aria-hidden
      >
        <span className="flex h-11 w-7 justify-center rounded-full border border-gold-200/70 pt-2 backdrop-blur-sm">
          <span className="scroll-cue-dot h-2 w-[3px] rounded-full bg-gold-200" />
        </span>
      </motion.div>

      {/* Bottom gradient to lift meta strip — sits above the frame margin */}
      <div
        className="absolute inset-x-0 bottom-0 z-[5] h-40 max-sm:h-20 pointer-events-none sm:h-48 lg:h-56"
        style={{
          background: "linear-gradient(to top, rgba(8,18,18,0.95), transparent)",
        }}
        aria-hidden
      />

      {/* Meta / stats strip — full-bleed, equal columns, evenly centered */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-0 bottom-0 z-10 border-t border-gold-300/30 bg-ink-900/40 backdrop-blur-xl"
      >
        <div className="grid w-full grid-cols-3 gap-px bg-white/10">
          {metaItems.map((m, i) => {
            const baseClass =
              "group relative flex flex-col items-center justify-center gap-0.5 overflow-hidden bg-ink-900/60 px-3 py-2.5 text-center sm:gap-1 sm:px-4 sm:py-4 transition-all duration-300 hover:bg-ink-800/70";

            const inner = (
              <>
                {/* hover glow sweep */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-amber-400/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <span className="relative flex w-full items-center justify-center gap-1 text-[9px] sm:gap-1.5 sm:text-[11px] uppercase tracking-[0.12em] sm:tracking-[0.22em] text-amber-300/70 font-bold">
                  <StatIcon name={m.icon} />
                  <span className="truncate">{m.label}</span>
                </span>
                <span
                  title={m.value}
                  className="text-gold-gradient relative w-full truncate font-display text-base font-bold tracking-tight sm:text-[1.7rem]"
                >
                  {m.value}
                </span>
              </>
            );

            return (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.7 + i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {"href" in m && m.href ? (
                  <a
                    href={m.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${baseClass} cursor-pointer`}
                  >
                    {inner}
                  </a>
                ) : (
                  <div className={baseClass}>{inner}</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Small icon set for the stats strip                                 */
/* ------------------------------------------------------------------ */
function iconFor(label: string): "bed" | "calendar" | "mountain" | "leaf" {
  if (/room|capacit|bed/i.test(label)) return "bed";
  if (/check|date|night/i.test(label)) return "calendar";
  if (/altitude|elevat|sea|height/i.test(label)) return "mountain";
  return "leaf";
}

function StatIcon({ name }: { name: "pin" | "bed" | "calendar" | "mountain" | "leaf" }) {
  const common = {
    width: 11,
    height: 11,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "pin":
      return (
        <svg {...common} className="shrink-0">
          <path d="M12 21s-7-6.5-7-11a7 7 0 1 1 14 0c0 4.5-7 11-7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case "bed":
      return (
        <svg {...common} className="shrink-0">
          <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
          <path d="M3 18h18M5 10V7a2 2 0 0 1 2-2h3v5" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common} className="shrink-0">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
      );
    case "mountain":
      return (
        <svg {...common} className="shrink-0">
          <path d="M3 20h18L14.5 6l-4 8-2-3L3 20z" />
          <path d="M13 20l-2.5-4.5" />
        </svg>
      );
    default:
      return (
        <svg {...common} className="shrink-0">
          <path d="M12 2C8 6 4 9 4 14a8 8 0 0 0 16 0c0-5-4-8-8-12z" />
        </svg>
      );
  }
}
