"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { easeOut } from "@/lib/motion";

type Step = {
  n: string;
  title: string;
  body: string;
  image: { src: string; alt: string };
};

const STEPS: Step[] = [
  {
    n: "01",
    title: "You describe the work.",
    body: "You write a goal in plain English. ZeusBot routes it to the right specialist, gathers the context, and starts.",
    image: {
      src: "/how-1.webp",
      alt: "A hand writing on parchment with a glowing inkwell, in dark cathedral light",
    },
  },
  {
    n: "02",
    title: "The fleet runs the play.",
    body: "Multiple agents pick up sub-tasks, talk to each other, and ship results. You watch on a dashboard.",
    image: {
      src: "/how-2.webp",
      alt: "Robed figures on stone steps, each holding a small glowing object, arranged like a constellation",
    },
  },
  {
    n: "03",
    title: "You ship the outcome.",
    body: "Reviewable artifacts: PRs, designs, drafts, reports. You approve. They ship — or they iterate.",
    image: {
      src: "/how-3.webp",
      alt: "A sealed scroll being handed across a stone threshold, with a glowing gold wax seal",
    },
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
              <div className="aspect-[16/10] rounded-2xl border border-hairline bg-ink-warm relative overflow-hidden">
                <Image
                  src={step.image.src}
                  alt={step.image.alt}
                  width={1280}
                  height={800}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="absolute inset-0 w-full h-full object-cover"
                  priority={i === 0}
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-ink-deep/80 to-transparent">
                  <span
                    className="eyebrow text-gold-orb"
                    style={{ letterSpacing: "0.12em" }}
                  >
                    STEP {step.n}
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
