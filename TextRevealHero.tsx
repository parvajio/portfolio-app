"use client";

import { useCallback, useEffect, useRef, type PointerEvent } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
} from "framer-motion";

/**
 * Giant headline with a "text reveal" sweep (same idea as Aceternity's Text Reveal Card).
 *
 * - `text`       : the dim word that is visible at rest (e.g. "Developer")
 * - `revealText` : the bright phrase uncovered by the sweep line (e.g. "Problem Solver")
 *
 * Behavior
 * - Autoplays a loop: sweep in -> hold -> sweep out -> hold. Works on touch devices too.
 * - Desktop pointer: hovering takes control (the line follows the cursor); leaving resumes autoplay.
 * - prefers-reduced-motion: no autoplay, rests on `text`. Hover still works (user-driven).
 * - Screen readers get one plain sentence; the visual layers are aria-hidden.
 *
 * Performance: everything runs on MotionValues, so there are no React re-renders per frame.
 */

type Props = {
  text: string;
  revealText: string;
  /** full loop duration in seconds (4 phases of equal length) */
  loopSeconds?: number;
  className?: string;
};

const BIG_TEXT_CLASS =
  "flex items-center justify-center whitespace-nowrap text-center font-black uppercase leading-none tracking-tight";

// Fits "PROBLEM SOLVER" from 320px to wide desktop. Tune the middle value if your font is wider/narrower.
const BIG_TEXT_STYLE = { fontSize: "clamp(2rem, 8.5vw, 8rem)" } as const;

export default function TextRevealHero({
  text,
  revealText,
  loopSeconds = 7,
  className = "",
}: Props) {
  const reduce = useReducedMotion();

  // p = how much of the reveal phrase is uncovered, 0..100 (left to right)
  const p = useMotionValue(0);
  const clipPath = useTransform(p, (v) => `inset(0 ${100 - v}% 0 0)`);
  const lineLeft = useTransform(p, (v) => `${v}%`);
  const lineOpacity = useTransform(p, [0, 3, 97, 100], [0, 1, 1, 0]);

  const controls = useRef<AnimationPlaybackControls | null>(null);
  const hovering = useRef(false);

  const play = useCallback(() => {
    controls.current?.stop();
    if (reduce) {
      p.set(0);
      return;
    }
    controls.current = animate(p, [p.get(), 100, 100, 0, 0], {
      duration: loopSeconds,
      times: [0, 0.25, 0.5, 0.75, 1],
      ease: "easeInOut",
      repeat: Infinity,
    });
  }, [p, reduce, loopSeconds]);

  useEffect(() => {
    play();
    return () => controls.current?.stop();
  }, [play]);

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return; // touch uses autoplay only
    const rect = e.currentTarget.getBoundingClientRect();
    const v = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    if (!hovering.current) {
      hovering.current = true;
      controls.current?.stop();
    }
    p.set(v);
  };

  const onPointerLeave = () => {
    if (!hovering.current) return;
    hovering.current = false;
    play();
  };

  return (
    <div
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={`relative w-full select-none ${className}`}
    >
      <p className="sr-only">{`${revealText}. ${text}.`}</p>

      <div aria-hidden="true" className="relative">
        {/* Base layer: dim word with a soft vertical fade */}
        <div
          className={BIG_TEXT_CLASS}
          style={{
            ...BIG_TEXT_STYLE,
            backgroundImage:
              "linear-gradient(to bottom, color-mix(in srgb, var(--text, #e8eaee) 38%, transparent), transparent 95%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {text}
        </div>

        {/* Reveal layer: bright phrase, clipped by the sweep */}
        <motion.div
          className={`absolute inset-0 ${BIG_TEXT_CLASS}`}
          style={{
            ...BIG_TEXT_STYLE,
            clipPath,
            color: "color-mix(in srgb, var(--text, #e8eaee) 88%, var(--accent, #7c9cff))",
          }}
        >
          {revealText}
        </motion.div>

        {/* Sweep line */}
        <motion.div
          className="pointer-events-none absolute top-[6%] h-[88%] w-[2px] -translate-x-1/2"
          style={{
            left: lineLeft,
            opacity: lineOpacity,
            backgroundImage:
              "linear-gradient(to bottom, transparent, var(--text, #e8eaee), transparent)",
          }}
        />
      </div>
    </div>
  );
}
