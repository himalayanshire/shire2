"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Site-wide polish, no visible content of its own:
 *  - a gold scroll-progress hairline at the top of the viewport
 *  - scroll-triggered reveals for [data-reveal] and .img-reveal elements, plus the
 *    top-level blocks of inner-page sections
 * Reveal classes are added by script only, so nothing is hidden without JS, and
 * anything already on screen at load is left alone to avoid a flash.
 */
export function PremiumEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const bar = document.querySelector<HTMLElement>(".scroll-progress");
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar?.style.setProperty("--scroll", progress.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    const isHome = pathname === "/";
    const targets = new Set<HTMLElement>();
    document.querySelectorAll<HTMLElement>("[data-reveal], .img-reveal").forEach((el) => targets.add(el));
    if (!isHome) {
      document
        .querySelectorAll<HTMLElement>("main section > *, main article > *")
        .forEach((el) => {
          if (el.matches("script, style, link") || el.closest("[data-no-reveal]")) return;
          targets.add(el);
        });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    const viewportH = window.innerHeight;
    let index = 0;
    targets.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const isImage = el.classList.contains("img-reveal");
      if (rect.top < viewportH * 0.92 && rect.bottom > 0) {
        // Already on screen: reveal images gently, leave everything else untouched.
        if (isImage) requestAnimationFrame(() => el.classList.add("is-visible"));
        return;
      }
      if (!isImage) {
        el.classList.add("reveal-ready");
        el.style.setProperty("--reveal-delay", `${(index++ % 4) * 70}ms`);
      }
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pathname]);

  return <div className="scroll-progress" aria-hidden />;
}
