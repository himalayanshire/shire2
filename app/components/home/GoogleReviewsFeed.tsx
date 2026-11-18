"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GOOGLE_REVIEWS, GOOGLE_REVIEWS_SUMMARY as SUMMARY, type GoogleReview } from "@/lib/social-feeds";

const BLUE = "#006dff";
const CARD_BG = "#f6f6f8";
const GAP = 20;

function Stars({ size = 18 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="#fcbf02" aria-hidden>
          <path d="M12 2.5l2.94 6.1 6.56.9-4.8 4.6 1.2 6.6L12 17.5l-5.9 3.2 1.2-6.6-4.8-4.6 6.56-.9L12 2.5z" />
        </svg>
      ))}
    </span>
  );
}

function GoogleG({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function GoogleWordmark() {
  const letters: [string, string][] = [
    ["G", "#4285F4"],
    ["o", "#EA4335"],
    ["o", "#FBBC05"],
    ["g", "#4285F4"],
    ["l", "#34A853"],
    ["e", "#EA4335"],
  ];
  return (
    <span className="text-[19px] font-medium leading-none tracking-tight" aria-label="Google">
      {letters.map(([c, color], i) => (
        <span key={i} style={{ color }} aria-hidden>
          {c}
        </span>
      ))}
    </span>
  );
}

function VerifiedBadge() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-label="Verified" role="img">
      <circle cx="12" cy="12" r="11" fill={BLUE} />
      <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SummaryCard() {
  return (
    <div className="flex h-full flex-col rounded-3xl p-5" style={{ backgroundColor: CARD_BG }}>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8D38FF] to-[#006dff] text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9L12 2zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
          </svg>
        </span>
        <div className="leading-tight">
          <p className="bg-gradient-to-r from-[#8D38FF] to-[#006dff] bg-clip-text text-sm font-semibold text-transparent">
            AI-Generated Summary
          </p>
          <p className="text-xs text-[#111]/60">Based on {SUMMARY.count} Google reviews</p>
        </div>
      </div>
      <div className="mt-4">
        <Stars />
      </div>
      <ul className="mt-4 space-y-3 text-[15px] leading-snug text-[#111]">
        {SUMMARY.aiSummary.map((line) => (
          <li key={line} className="flex gap-2.5">
            <svg className="mt-1 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 12.5l5 5L20 6.5" />
            </svg>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReviewCard({ review }: { review: GoogleReview }) {
  const photos = review.photos ?? [];
  const long = review.text.length > 110;
  return (
    <article className="flex h-full flex-col rounded-3xl p-5" style={{ backgroundColor: CARD_BG }}>
      <div className="flex items-center gap-3">
        <span className="relative block h-10 w-10 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={review.avatar}
            alt=""
            width={40}
            height={40}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border border-[#f6f6f8] bg-white">
            <GoogleG size={11} />
          </span>
        </span>
        <div className="min-w-0 leading-tight">
          <a
            href={review.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm font-bold text-[#111] hover:underline"
          >
            <span className="truncate">{review.name}</span>
            <VerifiedBadge />
          </a>
          <p className="mt-0.5 text-xs text-[#111]/60">{review.date}</p>
        </div>
      </div>

      <div className="mt-3">
        <Stars />
      </div>

      <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-[#111]">{review.text}</p>
      {long && (
        <a href={review.url} target="_blank" rel="noreferrer" className="mt-1 w-fit text-sm" style={{ color: BLUE }}>
          Read more
        </a>
      )}

      {photos.length > 0 && (
        <a
          href={review.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`See ${review.name}'s review photos on Google`}
          className="mt-4 grid grid-cols-2 gap-1 overflow-hidden rounded-md"
        >
          {photos.slice(0, 4).map((src, i) => (
            <span key={src} className="relative block aspect-square overflow-hidden bg-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                loading="lazy"
                referrerPolicy="no-referrer"
                className="absolute inset-0 h-full w-full object-cover"
              />
              {review.morePhotos && i === 3 && photos.length >= 4 && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-lg font-semibold text-white">
                  +{review.morePhotos}
                </span>
              )}
            </span>
          ))}
        </a>
      )}
    </article>
  );
}

export function GoogleReviewsFeed() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const scrollByCard = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const step = (first?.offsetWidth ?? el.clientWidth) + GAP;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const arrow =
    "absolute top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[rgba(17,17,17,0.5)] text-white transition-colors hover:bg-[#111]";

  return (
    <div className="text-[#111]">
      <h3 className="mb-6 text-center text-2xl font-bold">{SUMMARY.title}</h3>

      {/* Rating bar */}
      <div
        className="mb-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-3xl px-5 py-4"
        style={{ backgroundColor: CARD_BG }}
      >
        <a
          href={SUMMARY.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex flex-wrap items-center gap-x-2 gap-y-1"
        >
          <span className="text-lg font-bold">{SUMMARY.rating}</span>
          <Stars size={20} />
          <span className="text-sm">{SUMMARY.count} reviews on</span>
          <GoogleWordmark />
        </a>
        <a
          href={SUMMARY.writeReviewUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-full px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: BLUE }}
        >
          Review us on Google
        </a>
      </div>

      {/* Carousel */}
      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={update}
          className="flex snap-x snap-mandatory items-stretch overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ gap: GAP }}
        >
          {[<SummaryCard key="summary" />, ...GOOGLE_REVIEWS.map((r) => <ReviewCard key={r.url} review={r} />)].map(
            (card, i) => (
              <div
                key={i}
                className="w-full shrink-0 snap-start md:w-[calc((100%-20px)/2)] lg:w-[calc((100%-40px)/3)]"
              >
                {card}
              </div>
            )
          )}
        </div>

        {canPrev && (
          <button type="button" onClick={() => scrollByCard(-1)} aria-label="Previous reviews" className={`${arrow} -left-2 sm:-left-3`}>
            <ChevronLeft size={18} />
          </button>
        )}
        {canNext && (
          <button type="button" onClick={() => scrollByCard(1)} aria-label="Next reviews" className={`${arrow} -right-2 sm:-right-3`}>
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
