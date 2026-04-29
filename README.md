# ZeusBot — marketing site

The cinematic marketing surface for [ZeusBot](https://zeusbot-site.pages.dev) —
agentic AI as a service for small business.

## Stack

- Next.js 16 App Router (static export → Cloudflare Pages)
- React 19
- Tailwind v4 (CSS-first `@theme`, palette derived from the hero video)
- Framer Motion 12 (micro-interactions, `whileInView` reveals)
- GSAP 3 + ScrollTrigger (scroll-pinned hero video scrub — Day 2)
- Lenis 1.x (smooth scroll, coupled to ScrollTrigger)
- shadcn primitives (Button + Dialog only — `@radix-ui/react-dialog`)
- `next/font` self-hosted: Instrument Serif italic + Geist Sans + Geist Mono

## Develop

```bash
npm install
npm run dev       # http://localhost:3000
```

## Build

```bash
npm run build     # Produces /out (static HTML+JS+CSS for Cloudflare Pages)
```

## Status

| Section | Status |
|---|---|
| Day 1 — scaffold, sections, static hero | shipped |
| Day 2 — `<HeroScrollPin>` (GSAP + Lenis + video scrub) | pending |
| Day 3 — Lighthouse pass, asset pipeline, iris renders integrated | pending |

## Spec

Design package lives in the Sage tree at `orgs/zeus/shared/zeusbot-site/`:

- `design-spec.md` — tokens, typography, sections, AI-slop test
- `scroll-choreography.md` — 9-anchor scroll → video → overlay map
- `assets-brief.md` — asset pipeline, iris dispatch
- `stack.md` — stack picks (this repo)
- `content-locks.md` — Bode-confirmed content (pricing, mailto)
- `design-ratification.md` — CTO sign-off

## Placeholders

Several sections render with placeholder slots awaiting iris renders or Bode
confirms. Search for `PLACEHOLDER` in the codebase — every slot is annotated.
