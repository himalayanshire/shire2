import * as React from "react";

/**
 * Shire mark — twin Himalayan peaks with a gold sun on a deep-forest disc.
 * Pure SVG, decorative unless a title is given.
 */
export function ShireIcon({ className, title }: { className?: string; title?: string }) {
  const id = React.useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="6" y1="4" x2="42" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1a5c36" />
          <stop offset="1" stopColor="#0C2A1A" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="24" fill={`url(#${id}-bg)`} />
      <circle cx="33" cy="16" r="4" fill="#f5c542" />
      <path d="M6 35 17.5 17 25 28.5 29.5 22 42 35Z" fill="#F1EDE2" />
      <path d="M17.5 17 13.3 23.6l2.6-1.2 1.6 1.7 1.7-1.7 1.6 1.2Z" fill="#cfd8c8" />
      <path d="M6 35h36v1.5a10.5 10.5 0 0 1-10.5 10.5h-15A10.5 10.5 0 0 1 6 36.5Z" fill="#0C2A1A" opacity=".35" />
    </svg>
  );
}
