# Design Brief

Visual rules for the portfolio. `docs/PLAN.md` defines behavior; this file defines how it looks and what the UI may say. If the two ever conflict on appearance, this file wins.

## 0. Theme (one decision)

```text
THEME: dark
```

Change that line to `light` to switch. Both palettes are below. Do not add a theme toggle unless asked.

| Token | Dark (default) | Light |
|---|---|---|
| `--bg` | `#0b0d10` | `#f7f8fa` |
| `--surface` | `#12151a` | `#ffffff` |
| `--surface-2` | `#181c22` | `#eef0f4` |
| `--border` | `#242933` | `#dfe2e8` |
| `--text` | `#e8eaee` | `#121722` |
| `--text-muted` | `#9aa3b2` | `#5b6577` |
| `--accent` | `#7c9cff` | `#2f5bff` |
| `--accent-contrast` | `#0b0d10` | `#ffffff` |
| `--accent-2` (Hero gradients only) | `#a78bfa` | `#7a4dff` |

Rules:
- ONE accent color, used for active nav, links, focus rings, the primary button, and the return-to-hero ring.
- Text contrast WCAG AA or better. Muted text must still be readable.
- All colors live as CSS variables / Tailwind theme tokens. No hardcoded hex in components.

## 1. Voice and mood

Developer workspace: calm, precise, confident. Think code editor or documentation site, not an agency showcase. Lots of empty space, big typography, restraint. Polished, not flashy.

## 2. Typography

- Body and headings: a clean sans via `next/font` (Inter or Geist).
- Labels, chips, metadata, small captions: a monospace (JetBrains Mono or Geist Mono), uppercase with slight letter-spacing for tiny labels.
- Hero name: very large, tight leading, bold.
- Define one type scale (h1, h2, h3, body, small, label) as tokens and reuse it.

## 3. Content rules (important)

The UI may only show:
- content from `data/*.ts`,
- navigation labels,
- short, human-facing hints.

The UI must NEVER show:
- implementation details: pixel thresholds, `h-dvh`, "one-shot", "prefetch", timings, component or file names,
- plan or version labels ("v3 plan", "Phase 2", "Hero-1"),
- the route list or URL paths as decoration (`/profile`, `/work`),
- invented numbers or claims: project counts, years, users, availability badges ("open to work"), awards, metrics, testimonials,
- placeholder marketing copy.

If a fact is unknown, show nothing or a clearly marked `TODO` in development only. Never fabricate.

## 4. Hero (`/`)

Concept: a huge animated **text-reveal headline**. A dim word sits at rest; a bright phrase is uncovered by a vertical sweep line. It autoplays in a loop (so it works on touch and on first impression) and, on desktop, follows the pointer while hovering. Same technique as Aceternity's Text Reveal Card (`text` + `revealText`).

Canvas: 1440x900 desktop, 390x844 mobile. Centered single column, vertically centered, 100dvh. ONE focal area.

Exact content (all from `data/profile.ts` under `hero`), nothing else:
- `<h1>`: "Hi, I'm" (muted) + "Parvaj Mosharof" (gradient accent to accent-2)
- Giant headline: rest word `DEVELOPER`, revealed phrase `PROBLEM SOLVER` (uppercase via CSS)
- Tagline: "Crafting [High-Performance | Scalable] [Web Solution] with Next.js & Modern Technologies." where the first bracket rotates and the second is a gradient pill
- Explore button and one subtle hint (rendered by `HeroEntry`)
- Optional bottom links: GitHub, LinkedIn, Resume (from data), small and muted

Motion:
- Sweep loop (default 7s): sweep in 25%, hold 25%, sweep out 25%, hold 25%. Rest state is `DEVELOPER`.
- Hovering (mouse/pen) takes control: the line follows the cursor. Leaving resumes the loop. Touch never takes control; it only autoplays.
- Rotating word changes about every 2.6s with a short fade/slide. All words share one grid cell so the layout never shifts.
- `prefers-reduced-motion`: no loop (rests on `DEVELOPER`), rotating word shows the first word only.

Accessibility:
- The giant headline is `aria-hidden`; screen readers get one sr-only sentence ("Problem Solver. Developer."). The tagline likewise has one sr-only sentence.
- Exactly one `<h1>` (greeting + name).

Background: near-black with two soft, static CSS glows (accent and accent-2 at low opacity). No video, canvas, 3D, or animated backgrounds.

Gradient exception: in the Hero ONLY, the name and the pill may use a two-stop gradient from `--accent` to `--accent-2`. Everywhere else, one accent color.

No cards, no sidebar preview, no route list, no secondary hero panels. Behavior (one-shot entry) is defined in PLAN.md sections 3 and 4.

## 5. Portfolio shell

- Left nav: name/wordmark (plain text, not a link), Profile, Work, Contact, subtle active indicator (accent bar or dot). Footer: GitHub, LinkedIn, Email.
- Center: readable width (about 65 to 75 characters for text pages), wider for the Work grid.
- Right info panel: quiet, secondary. Muted labels (mono), values in normal text. Never competes with the center.
- Thin 1px borders between columns, no heavy shadows.

## 6. Components

- Buttons: primary (accent fill), secondary (outline), ghost (text). Same radius, min height 40px (44px on mobile).
- Chips: mono, small, `--surface-2` background, 1px border.
- Project cards: 16:10 cover, title, one-line description, up to 4 tech chips, status badge. Hover: slight lift (translateY -2px), subtle border color change, image zoom no more than 1.03. Whole card is one link.
- Section headings: clear hierarchy, small mono eyebrow above the heading where useful.
- Focus: visible 2px accent focus ring on every interactive element.
- Radius: one value family (for example 8px for controls, 14px for cards).

## 7. Return-to-Hero ring

Round progress ring with an up arrow and the label "Keep scrolling to go home". Accent stroke on a faint track, semi-opaque dark backing so it is readable on any content. Centered at the top of the center column. Appears only while the user is pushing. Does not intercept pointer events.

## 8. Motion

- Enter-only. Route content: fade plus 8 to 12px upward slide, 200 to 300ms, ease-out. Hero: staggered fade-up under 800ms total.
- Card hover 150ms.
- No exit animations, no parallax, no scroll-jacking, no looping animations other than one subtle arrow nudge on Explore.
- Everything is disabled or reduced under `prefers-reduced-motion`.

## 9. Mobile

- Not a shrunken desktop. Sticky header (name + hamburger), drawer nav, single column, 16px gutters, no horizontal scroll at 320px.
- Hero fills 100dvh, large thumb-friendly Explore button.

## 10. Images

Project screenshots in `public/projects/<slug>/`. Cover 16:10, consistent crop. Always meaningful alt text. Fallback to a neutral gradient when an image is missing.

## 11. Checklist before calling any UI task done

- [ ] No implementation details or invented content visible
- [ ] Colors/spacing/type come from tokens
- [ ] One accent color only
- [ ] Focus states visible, keyboard works
- [ ] Reduced motion respected
- [ ] Works at 320px and 1440px
