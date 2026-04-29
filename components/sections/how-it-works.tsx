"use client";

import { motion } from "framer-motion";
import { easeOut } from "@/lib/motion";

type Step = {
  n: string;
  title: string;
  body: string;
  /** Day-1: gradient block placeholder. Day 3: replace src with iris how-N.webp */
  illustration: { caption: string };
};

const STEPS: Step[] = [
  {
    n: "01",
    title: "You describe the work.",
    body: "You write a goal in plain English. ZeusBot routes it to the right specialist, gathers the context, and starts.",
    illustration: { caption: "PARCHMENT · INKWELL" },
  },
  {
    n: "02",
    title: "The fleet runs the play.",
    body: "Multiple agents pick up sub-tasks, talk to each other, and ship results. You watch on a dashboard.",
    illustration: { caption: "ROBED FIGURES · STONE STEPS" },
  },
  {
    n: "03",
    title: "You ship the outcome.",
    body: "Reviewable artifacts: PRs, designs, drafts, reports. You approve. They ship — or they iterate.",
    illustration: { caption: "SEALED SCROLL · THRESHOLD" },
  },
];

/**
 * HowItWorks — Day-1 sequential vertical flow with placeholder illustrations.
 *
 * Day 2 wraps the illustration column in a sticky GSAP-pinned crossfade per
 * design-spec.md §3.3 (left half sticky media, right half scrolling copy).
 * Day 3 replaces /how-N.webp placeholders with iris-rendered files.
 */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-32 lg:py-40 border-t border-hairline"
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: easeOut }}
          className="mb-16 max-w-2xl"
        >
          <span className="eyebrow">HOW IT WORKS</span>
          <h2
            className="font-display text-sand mt-3"
            style={{ fontSize: "var(--h1)", lineHeight: 1.1 }}
          >
            Three steps. No magic.
          </h2>
        </motion.div>

        <div className="grid gap-24">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: easeOut }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              {/* PLACEHOLDER — iris dispatch: how-{n}.webp 1280×800 */}
              <div className="aspect-[16/10] rounded-2xl border border-hairline bg-ink-warm relative overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse at 30% 40%, rgba(255,206,111,0.08), transparent 60%), linear-gradient(135deg, var(--ink-warm), var(--ink-deep))",
                  }}
                />
                <div className="relative h-full flex flex-col items-center justify-center gap-2 px-8 text-center">
                  <span
                    className="font-display text-gold-orb/40"
                    style={{ fontSize: "var(--display)", lineHeight: 1 }}
                  >
                    {step.n}
                  </span>
                  <span className="eyebrow text-bronze-mid">
                    {step.illustration.caption} · IRIS PENDING
                  </span>
                </div>
              </div>

              <div className="max-w-xl">
                <span
                  className="eyebrow text-gold-orb"
                  style={{ letterSpacing: "0.12em" }}
                >
                  STEP {step.n}
                </span>
                <h3
                  className="font-display text-sand mt-2 mb-4"
                  style={{ fontSize: "var(--h2)", lineHeight: 1.15 }}
                >
                  {step.title}
                </h3>
                <p className="text-bronze-up text-[17px] leading-relaxed">
                  {step.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
