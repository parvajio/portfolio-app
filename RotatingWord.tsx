"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Cycles through `words` with a soft fade/slide. All words are stacked in one grid cell,
 * so the widest word reserves the space and the layout never shifts.
 * Reduced motion: shows the first word only.
 * Decorative: the parent provides the full sentence for screen readers.
 */
export default function RotatingWord({
  words,
  intervalMs = 2600,
}: {
  words: string[];
  intervalMs?: number;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce || words.length < 2) return;
    const id = setInterval(() => setIndex((n) => (n + 1) % words.length), intervalMs);
    return () => clearInterval(id);
  }, [reduce, words.length, intervalMs]);

  return (
    <span className="inline-grid" aria-hidden="true">
      {words.map((word, i) => (
        <span
          key={word}
          className={`[grid-area:1/1] transition-all duration-500 motion-reduce:transition-none ${
            i === index ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
