"use client";

import Link from "next/link";

/**
 * Stub: one-shot Hero → Portfolio entry + Explore button + hint.
 * Full behavior (wheel/swipe/keyboard guards, mount delay, prefetch)
 * is defined in docs/PLAN.md sections 3-4 and will be implemented next.
 */
export default function HeroEntry() {
  return (
    <div className="flex flex-col items-center gap-3">
      <Link
        href="/profile"
        className="inline-flex min-h-[44px] items-center rounded-lg px-6 font-medium"
        style={{
          background: "var(--accent, #7c9cff)",
          color: "var(--accent-contrast, #0b0d10)",
        }}
      >
        Explore
      </Link>
      <p
        className="text-sm"
        style={{ color: "var(--text-muted, #9aa3b2)" }}
      >
        Scroll or press Explore to enter
      </p>
    </div>
  );
}
