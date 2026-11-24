"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  INSTAGRAM_COMPACT_COUNT,
  INSTAGRAM_EXPANDED_COUNT,
  INSTAGRAM_POSTS,
  INSTAGRAM_PROFILE,
  instagramPostUrl,
  type InstagramPost,
} from "@/lib/social-feeds";

function InstagramGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

function TypeBadge({ type }: { type: InstagramPost["type"] }) {
  return (
    <span className="absolute right-2.5 top-2.5 text-white drop-shadow" aria-hidden>
      {type === "video" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <path d="M10 8.5v7l6-3.5-6-3.5z" fill="currentColor" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
          <rect x="7" y="7" width="14" height="14" rx="3" />
          <path d="M4 16V6a2 2 0 0 1 2-2h10" strokeLinecap="round" />
        </svg>
      )}
    </span>
  );
}

export function InstagramFeed() {
  const [expanded, setExpanded] = useState(false);
  const visible = INSTAGRAM_POSTS.slice(0, INSTAGRAM_EXPANDED_COUNT);
  const posts = expanded ? visible : visible.slice(0, INSTAGRAM_COMPACT_COUNT);
  const canExpand = visible.length > INSTAGRAM_COMPACT_COUNT;

  return (
    <div className="relative">
      {/* Profile header */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-emerald-950">
        <a
          href={INSTAGRAM_PROFILE.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3"
          aria-label={`${INSTAGRAM_PROFILE.name} on Instagram`}
        >
          <span className="rounded-full bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#962fbf] p-[2px]">
            <span className="block overflow-hidden rounded-full border-2 border-cream-50 bg-cream-50">
              <Image
                src={INSTAGRAM_PROFILE.avatar}
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 object-cover"
              />
            </span>
          </span>
          <span className="text-left leading-tight">
            <span className="block text-base font-bold">{INSTAGRAM_PROFILE.handle}</span>
            <span className="block text-sm text-emerald-950/70">{INSTAGRAM_PROFILE.name}</span>
          </span>
        </a>

        <dl className="flex items-center gap-5 text-center leading-tight">
          {[
            [INSTAGRAM_PROFILE.posts, "posts"],
            [INSTAGRAM_PROFILE.followers, "followers"],
            [INSTAGRAM_PROFILE.following, "following"],
          ].map(([value, label]) => (
            <div key={label}>
              <dt className="sr-only">{label}</dt>
              <dd className="text-sm font-bold">{value}</dd>
              <dd className="text-xs text-emerald-950/70" aria-hidden>
                {label}
              </dd>
            </div>
          ))}
        </dl>

        <a
          href={INSTAGRAM_PROFILE.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-[#0095f6] px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1877f2]"
        >
          <InstagramGlyph size={16} />
          Follow
        </a>
      </div>

      {/* Posts — three across by default, six when expanded */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {posts.map((post, i) => (
          <a
            key={post.id}
            href={instagramPostUrl(post)}
            target="_blank"
            rel="noreferrer"
            aria-label={`View Instagram post ${i + 1} from @${INSTAGRAM_PROFILE.handle}`}
            className="group relative aspect-square overflow-hidden rounded-lg bg-[#f5f5f7] sm:rounded-xl"
          >
            <Image
              src={post.image}
              alt={`Instagram post by @${INSTAGRAM_PROFILE.handle}`}
              fill
              sizes="(max-width: 640px) 33vw, 360px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <TypeBadge type={post.type} />
            <span className="absolute inset-0 flex items-center justify-center gap-1.5 bg-[rgba(158,230,171,0.9)] text-sm font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 21s-7.5-4.6-9.6-9.2C1 8.6 2.9 5 6.3 5c2 0 3.4 1 4.2 2.3h3C14.3 6 15.7 5 17.7 5c3.4 0 5.3 3.6 3.9 6.8C19.5 16.4 12 21 12 21z" />
              </svg>
              {post.likes ?? ""}
            </span>
          </a>
        ))}
      </div>

      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="mx-auto mt-8 flex items-center gap-2 rounded-full border border-emerald-900/20 bg-cream-50 px-7 py-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-950 shadow-[var(--shadow-soft)] transition-all duration-300 hover:border-gold-500 hover:bg-gold-400"
        >
          {expanded ? "Show less" : "View more"}
          {expanded ? <ChevronUp size={14} strokeWidth={2.2} /> : <ChevronDown size={14} strokeWidth={2.2} />}
        </button>
      )}
    </div>
  );
}
