"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useRouter } from "next/navigation";

/**
 * Hard-scroll-up at the top of the portfolio returns to the Hero ("/").
 * Desktop only (lg+), where the shell is locked and the center column scrolls.
 *
 * Usage: render inside a `relative` wrapper that also contains the scroll container.
 *   <div className="relative h-full">
 *     <main ref={mainRef} className="h-full overflow-y-auto overscroll-contain">...</main>
 *     <ReturnToHero containerRef={mainRef} />
 *   </div>
 */

const THRESHOLD = 1000; // total upward wheel distance (px) needed. ~10 mouse notches. Tune this.
const ARM_IDLE_MS = 250; // wheel must pause this long before pushing counts (ignores momentum tail)
const DRAIN_AFTER_MS = 300; // after this much idle time, progress drains back
const DRAIN_PER_SEC = 3000; // drain speed (px/s)

const R = 26;
const C = 2 * Math.PI * R;

export default function ReturnToHero({
  containerRef,
}: {
  containerRef: RefObject<HTMLElement | null>;
}) {
  const router = useRouter();
  const [progress, setProgress] = useState(0); // 0..1

  const acc = useRef(0);
  const lastWheel = useRef(0);
  const armed = useRef(false);
  const fired = useRef(false);
  const shown = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const desktop = window.matchMedia("(min-width: 1024px)");
    let raf = 0;
    let running = false;
    let lastTick = 0;

    const publish = () => {
      const v = Math.round((acc.current / THRESHOLD) * 100) / 100;
      if (v !== shown.current) {
        shown.current = v;
        setProgress(v);
      }
    };

    const tick = (t: number) => {
      const dt = lastTick ? (t - lastTick) / 1000 : 0;
      lastTick = t;

      if (
        !fired.current &&
        acc.current > 0 &&
        performance.now() - lastWheel.current > DRAIN_AFTER_MS
      ) {
        acc.current = Math.max(0, acc.current - DRAIN_PER_SEC * dt);
      }
      publish();

      if (acc.current > 0 && !fired.current) {
        raf = requestAnimationFrame(tick);
      } else {
        running = false;
        lastTick = 0;
      }
    };

    const startLoop = () => {
      if (running) return;
      running = true;
      lastTick = 0;
      raf = requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      if (!desktop.matches || fired.current) return;

      const now = performance.now();
      const idle = now - lastWheel.current;
      lastWheel.current = now;

      // Still inside the content, or scrolling down: disarm and reset.
      if (el.scrollTop > 0 || e.deltaY >= 0) {
        armed.current = false;
        if (acc.current !== 0) {
          acc.current = 0;
          publish();
        }
        return;
      }

      // At the very top, pushing up. Only count a *fresh* gesture:
      // if the wheel was still moving when we arrived, it's momentum from scrolling up.
      if (!armed.current) {
        if (idle >= ARM_IDLE_MS) armed.current = true;
        else return;
      }

      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY; // Firefox line mode
      acc.current = Math.min(THRESHOLD, acc.current + Math.abs(dy));
      publish();
      startLoop();

      if (acc.current >= THRESHOLD) {
        fired.current = true;
        router.push("/");
      }
    };

    // passive: we never preventDefault; overscroll-contain on the container is enough
    el.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(raf);
    };
  }, [containerRef, router]);

  if (progress < 0.02) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-6 z-50 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex"
    >
      <div className="relative h-16 w-16">
        <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
          <circle cx="32" cy="32" r={R} fill="rgba(0,0,0,0.65)" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" />
          <circle
            cx="32"
            cy="32"
            r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
          />
        </svg>
        {/* up arrow */}
        <svg
          viewBox="0 0 24 24"
          className="absolute inset-0 m-auto h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </div>
      <span className="rounded bg-black/60 px-2 py-1 text-xs">Keep scrolling to go home</span>
    </div>
  );
}
