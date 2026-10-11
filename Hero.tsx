import HeroEntry from "./HeroEntry"; // existing client component: one-shot entry logic + Explore button + hint
import RotatingWord from "./RotatingWord";
import TextRevealHero from "./TextRevealHero";

export type HeroData = {
  greeting: string; // "Hi, I'm"
  name: string; // "Parvaj Mosharof"
  text: string; // dim rest word: "Developer"
  revealText: string; // bright revealed phrase: "Problem Solver"
  crafting: string; // "Crafting"
  words: string[]; // ["High-Performance", "Scalable"]
  pill: string; // "Web Solution"
  connector: string; // "with"
  tail: string; // "Next.js & Modern Technologies."
};

const gradientText = {
  backgroundImage: "linear-gradient(90deg, var(--accent, #7c9cff), var(--accent-2, #a78bfa))",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
} as const;

/** Server component. Only TextRevealHero, RotatingWord and HeroEntry are client components. */
export default function Hero({ hero }: { hero: HeroData }) {
  const spoken = `${hero.crafting} ${hero.words.join(" and ")} ${hero.pill} ${hero.connector} ${hero.tail}`;

  return (
    <section
      className="relative flex h-dvh w-full flex-col items-center justify-center overflow-hidden px-4 text-center"
      style={{ background: "var(--bg, #070912)", color: "var(--text, #e8eaee)" }}
    >
      {/* Static soft glows (no animation, no JS) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 h-[42rem] w-[42rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(124,156,255,0.14), transparent)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -right-40 h-[44rem] w-[44rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(167,139,250,0.12), transparent)" }}
      />

      <div className="relative z-10 flex w-full max-w-[1600px] flex-col items-center gap-6 sm:gap-8">
        <h1 className="text-lg tracking-[0.12em] sm:text-2xl">
          <span style={{ color: "var(--text-muted, #9aa3b2)" }}>{hero.greeting}</span>{" "}
          <span className="font-semibold" style={gradientText}>
            {hero.name}
          </span>
        </h1>

        <TextRevealHero text={hero.text} revealText={hero.revealText} />

        <p className="max-w-[92vw] text-base tracking-[0.1em] sm:text-xl">
          <span className="sr-only">{spoken}</span>
          <span aria-hidden="true" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <span className="inline-flex gap-2">
              <span>{hero.crafting}</span>
              <RotatingWord words={hero.words} />
            </span>
            <span className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
              <span
                className="rounded-lg px-3 py-1 font-medium"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, var(--accent, #7c9cff), var(--accent-2, #a78bfa))",
                  color: "var(--accent-contrast, #0b0d10)",
                }}
              >
                {hero.pill}
              </span>
              <span style={{ color: "var(--text-muted, #9aa3b2)" }}>{hero.connector}</span>
              <span>{hero.tail}</span>
            </span>
          </span>
        </p>

        {/* Explore button + one subtle hint live inside HeroEntry */}
        <HeroEntry />
      </div>
    </section>
  );
}
