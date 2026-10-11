# Portfolio Website: Build Plan v3

> **Scope of this file:** behavior, routes, scroll logic, and build order only. Visual rules and what the UI may display live in `docs/DESIGN.md`. Do not put anything from this plan (thresholds, timings, route names, phase or version labels) into the visible UI.

Changes from v2: enter-only transitions, dual scroll-mode handling, simpler hero trigger (mount delay replaces cooldown system), info panel collapses instead of becoming a separate layout, hero SEO, and a smaller initial scope.

---

## 1. Core Concept

Two modes:

1. **Hero**: full-screen landing at `/`
2. **Portfolio app**: locked three-column workspace on desktop, normal scrolling site on mobile

```text
/                  Hero
  ↓ one-shot gesture
/profile           Portfolio
/work              Projects
/work/[slug]       Project detail
/contact           Contact
```

**Initial scope: Profile, Work, Contact only.** Skills and Experience live inside Profile until they have enough substance to stand alone. Add `/skills` and `/experience` later only if the content earns it.

---

## 2. Route Architecture (App Router)

```text
app/
├── layout.tsx
├── page.tsx                  # Hero only (own layout, not in portfolio shell)
├── sitemap.ts
│
└── (portfolio)/
    ├── layout.tsx            # Shared shell
    ├── profile/page.tsx
    ├── work/
    │   ├── page.tsx
    │   └── [slug]/page.tsx
    └── contact/page.tsx
```

- `/` is not inside the portfolio layout.
- Every route works when opened directly. A recruiter landing on `/work/squad` never sees the Hero.

---

## 3. Hero → Portfolio Entry

Hero is `h-dvh overflow-hidden`, not a scrollable page.

### Triggers (all call one function)

- downward wheel (`deltaY > 30`)
- upward swipe
- `ArrowDown`, `PageDown`, `Space`
- Explore button

```tsx
const fired = useRef(false);
const ready = useRef(false);

useEffect(() => {
  // Ignore all input briefly after mount (see section 4)
  const t = setTimeout(() => (ready.current = true), 700);
  return () => clearTimeout(t);
}, []);

const go = () => {
  if (!ready.current || fired.current) return;
  fired.current = true;
  router.push("/profile");
};
```

### Keyboard details

- Call `preventDefault()` on `Space` / `PageDown` / `ArrowDown` only when handling them as the trigger.
- If the Explore button is focused, let the button handle `Space`/`Enter` itself. Don't double-fire (the `fired` ref also guards this).

### History behavior (decided)

Use `router.push`, not `replace`. Back from `/profile` returns to the Hero, which is the natural expectation. The mount delay in section 4 stops Back from bouncing the user straight forward again.

Prefetch `/profile` from the Hero.

---

## 4. Preventing Re-entry (simplified)

No sessionStorage, no timestamps, no separate cooldown system.

The ~700ms mount-time input lock (above) covers it: when the user returns to `/`, the Hero remounts, `ready` starts false, and leftover wheel/touch momentum is ignored until it expires.

Tune the delay during the spike. If trackpad momentum outlasts 700ms, raise it to 800-1000ms.

---

## 5. Hero Design and SEO

Content and composition are defined in `docs/DESIGN.md` section 4 (text-reveal headline Hero: "Hi, I'm Parvaj Mosharof", a giant DEVELOPER / PROBLEM SOLVER reveal, a short tagline, and the Explore button). This plan only defines behavior: the one-shot entry, the mount-time input lock, and the single Explore call to action.

Building web applications and integrating AI-powered features. Don't claim AI expertise the projects don't demonstrate.

Because `/` is the page Google and link previews see first, and it has little text:

- visible `<h1>` with name and role
- real meta description
- OG image and Twitter card
- `sitemap.ts` listing `/`, `/profile`, `/work`, each `/work/[slug]`, `/contact`
- skip-link or visible Explore button so it never reads as a gate

---

## 6. Portfolio Shell and Breakpoints

Layout logic is Tailwind only, no JS breakpoint detection.

| Breakpoint | Layout | Scroll |
|---|---|---|
| `xl:` (1280px+) | NAV \| CONTENT \| INFO | locked shell, only center scrolls |
| `lg:` (1024px+) | NAV \| CONTENT | locked shell, only center scrolls |
| below `lg:` | single column, hamburger/drawer nav | normal document scroll |

### Info panel: one component, two placements

- At `xl:` it is the right sidebar.
- Below `xl:` the **same component** renders as a collapsible block at the top of the content area.

This avoids three separate layouts and duplicated info logic.

```css
/* applied at lg: and up only */
.portfolio-shell { height: 100dvh; overflow: hidden; }
.portfolio-main  { height: 100%; overflow-y: auto; overscroll-behavior: contain; }
```

Below `lg:` none of these apply, so the document scrolls normally.

---

## 7. Returning to the Hero (hard scroll with progress ring)

The Hero is a route, so returning is `router.push("/")`, never `window.scrollTo`.

**Design decision:** there is no Home button. The way back is a deliberate hard scroll up at the very top of the portfolio, shown with a round progress ring. Otherwise the visitor stays in the portfolio. Normal scrolling never exposes the Hero.

Implemented in `ReturnToHero.tsx` (desktop `lg+` only):

- Counts upward wheel distance only when the center container is at `scrollTop === 0`.
- Needs ~1000px of pushing (about 10 mouse notches; tune `THRESHOLD`).
- **Momentum guard:** pushing only counts after the wheel has paused ~250ms at the top. Otherwise the tail of a normal scroll-up would start filling the ring on its own.
- Progress drains back if the user stops (~300ms), so a casual bump never goes home.
- Scrolling down, or any content scroll, resets progress.
- One-shot `fired` ref, then `router.push("/")`. The Hero's 700ms mount input lock stops it bouncing forward again.
- Ring shows a circular progress stroke, an up arrow, and the label "Keep scrolling to go home". It is `aria-hidden`, pointer-events none, and sits centered at the top of the content column.

**Discoverability:** the ring only appears once someone starts pushing, so first-time visitors may never find the way back. That is acceptable for this design, since staying in the portfolio is fine. A cheap hint: a small "scroll up to return home" line near the top of `/profile`.

**Mobile / below `lg`:** no hard-scroll behavior (document scrolling plus browser overscroll make it unreliable). The mobile header/drawer should include a Home entry.

**Keyboard / accessibility:** a hard-scroll gesture has no keyboard equivalent. Decide deliberately: either accept it, or keep the sidebar logo as a focusable `<Link href="/">` that is easy to ignore visually but available to keyboard and screen-reader users.

---

## 8. Two Scroll Modes (known risk area)

Desktop scrolls an inner container. Mobile scrolls the document. Both must be handled.

### ScrollReset must reset whichever scroller is active

```tsx
const pathname = usePathname();

useEffect(() => {
  mainRef.current?.scrollTo({ top: 0, behavior: "auto" }); // desktop container
  window.scrollTo({ top: 0, behavior: "auto" });           // mobile document
}, [pathname]);
```

### Things that behave differently in a custom scroller

- `#anchor` links and `scroll-margin-top`
- `scrollIntoView` targeting
- Ctrl+F / find-in-page jumps
- focus-driven scrolling
- `IntersectionObserver` roots (set `root` to the container on desktop)

### Required test

Resize the window across `lg:` back and forth while scrolled partway, on both `/work` and `/work/[slug]`. Confirm nothing gets stuck, clipped, or double-scrolled.

Every portfolio route starts at the top. No per-route scroll restoration initially.

---

## 9. Page Transitions (revised)

In the App Router, the old page unmounts before `AnimatePresence` can run an exit animation, so cross-fades are unreliable.

**Plan: enter-only animations.**

- New page fades/slides in on mount (short, subtle).
- No exit animations.
- Hero → Portfolio: since these are separate layouts, test the jump in the spike. If abrupt, add a brief overlay or fade-in on the portfolio shell mount.
- Revisit the View Transitions API (or Motion) in the visual design phase, not before.

---

## 10. Right Info Panel Content

Client Component using `usePathname()` and local data. No parallel routes.

```text
/profile      role, education, focus, resume
/work         project count, primary stack, categories
/work/[slug]  technologies, year, status, live/source links
/contact      availability, email, socials
```

---

## 11. Profile (absorbs Skills and Experience at first)

Sections inside `/profile`:

- name, role, short intro
- current focus
- education
- skills, grouped by capability (Frontend, Backend, Full-stack, AI integration, Tools). No percentages.
- experience (concise, honest)
- resume: [ View Resume ] [ Download CV ] (static PDF in `public/`)
- GitHub, LinkedIn, contact CTA

Split into `/skills` and `/experience` only when a section is long enough to justify a page.

---

## 12. Work and Project Pages

`/work` is the strongest part of the site. Cards show screenshot, title, short description, tech, status, role.

**Project detail structure** (`/work/[slug]`, must stand alone):

```text
← Back to Work
PROJECT NAME
Short summary
[ LARGE SCREENSHOT ]
ABOUT · FEATURES · TECH STACK · MY ROLE
IMPLEMENTATION · ARCHITECTURE · CHALLENGES · WHAT I LEARNED
[ More screenshots ]
[ Live Demo ] [ Source Code ]
[ Contact Me ]
```

### Data model (`data/projects.ts`)

```ts
type Project = {
  slug: string;
  title: string;
  description: string;
  year: string;

  featured: boolean;
  order: number;          // explicit sort order for cards
  role: string;
  status: string;

  technologies: string[];

  image: string;
  screenshots: string[];

  features: string[];
  challenges?: string[];
  lessons?: string[];

  liveUrl?: string;       // optional
  sourceUrl?: string;     // optional
};
```

Sort by `order`. Use `featured` for highlighting. The same data drives cards, detail pages, metadata, and the info panel. Use `generateStaticParams()` for slugs.

---

## 13. Contact

Keep it simple. No form.

```text
Have a project or opportunity?
[ Email Me ]  (mailto:)
GitHub · LinkedIn · Resume
```

A form brings delivery, validation, spam protection, and rate limiting. Skip until there is a real need.

---

## 14. Navigation

Real `<Link>`s with an active state.

```ts
const navigation = [
  { label: "Profile", href: "/profile" },
  { label: "Work", href: "/work" },
  { label: "Contact", href: "/contact" },
];
```

Add Skills and Experience entries only when those routes exist.

---

## 15. Animation, Accessibility, Performance

**Animate:** Hero entrance, route enter animation, card hover, active nav, image reveal.
**Avoid:** continuous wheel hijacking, long blocking animations, heavy parallax, unnecessary 3D.

**Accessibility:** semantic headings, real links/buttons, visible focus, keyboard-operable Hero entry, alt text, contrast, `prefers-reduced-motion` (disable route/Hero animations and smooth scroll; entry and navigation must still work).

**Performance:** `next/image`, small card thumbnails vs larger detail screenshots, lazy loading, few Client Components (likely: `HeroEntry`, `MobileNav`, `InfoPanel`, `ScrollReset`, animated bits), no background video, no oversized assets.

---

## 16. Metadata

```text
/             Portfolio — MD. Parvaj Mosharof
/profile      Profile — MD. Parvaj Mosharof
/work         Projects — MD. Parvaj Mosharof
/work/squad   Squad — E-commerce Project — MD. Parvaj Mosharof
```

Generate project metadata from project data via `generateMetadata`.

---

## 17. Structure

```text
components/
├── hero/         Hero.tsx, HeroEntry.tsx
├── portfolio/    PortfolioShell, Sidebar, PortfolioMain, InfoPanel, ReturnToHero, ScrollReset
├── projects/     ProjectCard, ProjectGrid, ProjectDetail, ProjectGallery
└── navigation/   DesktopNav, MobileNav

data/
├── projects.ts
├── navigation.ts
├── profile.ts     (includes skills and experience for now)
```

---

## 18. Development Order

Only the interaction can invalidate the design, so it comes first. Content comes before polish.

### Phase 0: Throwaway spike

Routes: `/`, `/profile`, `/work`, `/work/example`, with placeholder boxes.

Test:

- Hero trigger: trackpad momentum, mouse wheel, touch, keyboard, button
- mount delay value (does Back from `/profile` bounce forward?)
- inner scroll + `ScrollReset` on both scroll modes
- resize across `lg:` while scrolled
- Back/Forward, direct `/work` and `/work/example`
- Hero → portfolio transition feel (abrupt or fine?)

If it doesn't feel good here, change it before building anything real.

### Phase 1: Routing
All routes and links working. No animation.

### Phase 2: Shell
Sidebar, main, info panel (xl sidebar / collapsible below), `ReturnToHero` (hard-scroll ring). Get widths, overflow, and breakpoints right. Tune `THRESHOLD` and the momentum guard on a real trackpad and a mouse.

### Phase 3: Hero entry
`h-dvh overflow-hidden`, triggers, one-shot guard, mount delay, prefetch, SEO.

### Phase 4: Scroll reset
Both scrollers, verified on every route.

### Phase 5: Real content (two projects first)
Write **two projects fully** (detail pages complete) before anything else. Then Profile (with skills/experience) and Contact. Work and project pages are what recruiters judge.

### Phase 6: Visual design
Typography, spacing, cards, hover, enter transitions, Hero composition. Consider View Transitions API here.

### Phase 7: Mobile
Header, drawer menu, single column, normal scrolling, real-device touch testing.

### Phase 8: QA
Keyboard, reduced motion, Lighthouse, slow network, mobile Chrome/Safari, desktop Chrome/Firefox, direct URLs, Back/Forward, sitemap and OG previews.

---

## 19. Final UX

**Desktop**

```text
/  Hero (full screen)
   ↓ one-shot gesture
/profile
┌──────────────┬──────────────────────────────┬──────────────┐
│ PROFILE      │                              │              │
│ WORK         │       CURRENT PAGE           │    INFO      │
│ CONTACT      │       (center scrolls)       │              │
│              │                              │   ↑ HOME     │
└──────────────┴──────────────────────────────┴──────────────┘
```

Normal scrolling never exposes the Hero. A hard scroll up at the top (with a round progress ring) is the way back.

**Mobile:** Hero, then one-shot gesture, then a normal scrolling single-column site with a header menu.

## Most important rule

**Prototype the Hero trigger, portfolio shell, inner scroll, and the two-scroll-mode switch before any visual design.** If that feels right, the rest is straightforward.