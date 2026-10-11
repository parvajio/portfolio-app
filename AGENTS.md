# Portfolio: Agent Rules

Personal portfolio for MD. Parvaj Mosharof (full-stack developer, CSE student).
Stack: Next.js App Router, TypeScript, Tailwind CSS, Framer Motion.

## Where things are (read the right file for the task)

| Need | File | Read it when |
|---|---|---|
| Behavior, routes, scroll logic, build order | `docs/PLAN.md` | any structural, routing, layout, scroll, or interaction work |
| Theme, tokens, typography, allowed UI content, motion | `docs/DESIGN.md` | ANY UI, styling, copy, or design work |
| Hard-scroll return to Hero (finished component) | `components/portfolio/ReturnToHero.tsx` | working on the shell or anything near it. Do not rewrite its logic |
<!-- | Hero (finished components) | `components/hero/Hero.tsx`, `TextRevealHero.tsx`, `RotatingWord.tsx` | working on `/`. Do not rewrite their logic |
| Hero entry logic (one-shot trigger) | `components/hero/HeroEntry.tsx` | changing how the Hero is entered | -->
| All content (profile, projects, nav, hero text) | `data/*.ts` | adding or changing any text or project |
| Phase-by-phase prompts | `docs/PHASES.md` (optional copy) | only if I reference a phase by number |

If a file above does not exist yet, tell me instead of inventing its contents.

## Core concept (do not change without asking)

- `/` is a full-screen Hero (`h-dvh overflow-hidden`), NOT inside the portfolio layout, and never scrollable.
- Portfolio routes live in `app/(portfolio)/` and share one shell layout.
- Desktop (lg and up): shell is `h-dvh overflow-hidden`; ONLY the center column scrolls (`overflow-y-auto overscroll-contain`).
  xl = NAV | CONTENT | INFO. lg = NAV | CONTENT (info becomes a collapsible block, same component).
- Below lg: normal document scroll, single column, header + drawer nav. No inner scroll container.
- Hero entry is a ONE-SHOT trigger through a single `go()` guarded by `ready` (about 700ms mount lock) and `fired` refs.
  Triggers: wheel down (deltaY > 30), upward swipe (40px), ArrowDown, PageDown, Space, Explore button. Use `router.push("/profile")`.
- There is NO Home button on desktop. The way back to the Hero is a deliberate hard scroll up at the top of the center column,
  shown with a round progress ring (`ReturnToHero.tsx`, lg and up only), using `router.push("/")`.
  The mobile drawer has a Home link. Never use `window.scrollTo` to reach the Hero.
- ScrollReset must reset BOTH the center container and `window` on every pathname change.
- Animations are enter-only. No exit animations between routes.

## Content rules (strict)

- Show only content from `data/*.ts`, navigation labels, and short human-facing hints.
- NEVER show in the UI: thresholds, timings, `h-dvh`, "one-shot", "prefetch", component or file names, plan or version labels,
  route lists or URL paths as decoration.
- NEVER invent: stats, counts, years, users, awards, availability badges, project descriptions, metrics, or experience.
  If a fact is missing, leave it out or use a clearly marked `TODO` in data files only.

## Code rules

- Server Components by default. Add `"use client"` only where browser APIs are required
  (HeroEntry, TextRevealHero, RotatingWord, MobileNav, InfoPanel, ScrollReset, ReturnToHero, lightbox, copy button).
- Content lives in `data/*.ts`, never hardcoded in components.
- Use `next/link` for navigation and `next/image` for images. No `router.push` for ordinary links.
- Breakpoint layout uses Tailwind classes only. No JS breakpoint detection (the one `matchMedia` in `ReturnToHero` is the exception).
- Strict TypeScript, no `any`.
- Respect `prefers-reduced-motion`. Keyboard access, visible focus, semantic landmarks, and alt text are required.
- Colors, spacing, and type come from the tokens in `docs/DESIGN.md`. No hardcoded hex values in components.
- Do not install dependencies without asking. Do not refactor unrelated files. Keep changes scoped to the task.

## Working style

- For anything non-trivial, plan first (Plan agent), wait for my approval, then build.
- One phase or slice per task. If a request is too big, split it and implement only step 1.
- If you find a bug in a finished component (`ReturnToHero`, Hero components), explain it and wait. Do not change the algorithm silently.
- List every assumption you made and anything you wrote that I did not supply.
- Never run `git push`, force-push, or rewrite history. I commit.

## Commands

- `npm run dev`: dev server
- `npm run lint`: lint
- `npm run build`: production build

## Definition of done

1. `npm run lint` and `npm run build` pass.
2. No content or implementation details break the content rules above.
3. You list files changed and a numbered manual test checklist. Scroll, touch, and trackpad behavior must be tested by me on real devices; say what you could not verify.