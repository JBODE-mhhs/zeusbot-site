"use client";

import { motion } from "framer-motion";
import { easeOut } from "@/lib/motion";
import { buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { CONTACT_MAILTO } from "@/lib/constants";

/**
 * Hero — Day-1 static placeholder.
 *
 * Day 2 wraps this with <HeroScrollPin> (GSAP ScrollTrigger + Lenis + video
 * scrub per scroll-choreography.md §1). Today: poster + overlay text rendered
 * at the A4 final state from scroll-choreography.md §2 — i.e. what
 * reduced-motion users see in production. This guarantees the page is fully
 * usable during scaffold and matches the spec's reduced-motion fallback (§5).
 */
export function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen w-full overflow-hidden bg-ink-deep flex items-center"
      aria-label="ZeusBot — a fleet of agents"
    >
      {/* Background: poster (frame_mid). Day 2 swaps to <video> with scrub. */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: "url(/poster.webp)",
          backgroundColor: "var(--ink-deep)",
        }}
        aria-hidden
      />
      {/* Tonal scrim — keeps text legible over the brightest poster regions */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-deep via-ink-deep/70 to-transparent"
        aria-hidden
      />

      <div className="max-w-[1280px] mx-auto w-full px-6 lg:px-12 pt-32 pb-24">
        <div className="max-w-[640px] grid gap-6">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="eyebrow"
          >
            ZEUSBOT — A FLEET OF AGENTS
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: easeOut }}
            className="font-display text-sand"
            style={{
              fontSize: "var(--display)",
              lineHeight: 1.02,
              textShadow: "0 1px 16px rgba(0,0,0,0.6)",
            }}
          >
            Some problems
            <br />
            take a <em>fleet</em>.
            <br />
            We forge the agents
            <br />
            that ship the work.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: easeOut }}
            className="text-sand/85 max-w-[540px]"
            style={{ textShadow: "0 1px 12px rgba(0,0,0,0.5)" }}
          >
            ZeusBot is agentic AI as a service for small business — a coordinated
            fleet of specialists, always on, always shipping.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: easeOut }}
            className="flex flex-wrap gap-3 mt-2"
          >
            <a
              href={CONTACT_MAILTO}
              className={buttonVariants({ variant: "primary", size: "lg" })}
            >
              Request demo
            </a>
            <Dialog>
              <DialogTrigger
                className={buttonVariants({ variant: "ghost", size: "lg" })}
              >
                Watch the fleet
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Watch the fleet</DialogTitle>
                <div className="aspect-video w-full overflow-hidden rounded-xl border border-hairline-up bg-ink-deep">
                  <video
                    src="/source.mp4"
                    poster="/poster.webp"
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="eyebrow mt-12"
          >
            ↓ Scroll
          </motion.div>
        </div>
      </div>
    </section>
  );
}
