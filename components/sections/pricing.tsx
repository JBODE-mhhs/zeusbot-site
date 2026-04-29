"use client";

import { motion } from "framer-motion";
import { easeOut } from "@/lib/motion";
import { buttonVariants } from "@/components/ui/button";
import { CONTACT_MAILTO } from "@/lib/constants";

/**
 * Pricing — locked tiers per content-locks.md (LOCKED 2026-04-28 by Bode).
 * Deposit fixed at $5,000 across every tier; only monthly varies.
 * Forge is the default (gold border).
 */
type Tier = {
  name: string;
  setup: string;
  monthly: string;
  tagline: string;
  audience: string;
  highlighted?: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Atelier",
    setup: "$5,000 setup",
    monthly: "$199 / month",
    tagline: "One agent, you direct it.",
    audience: "For solo operators.",
  },
  {
    name: "Forge",
    setup: "$5,000 setup",
    monthly: "$499 / month",
    tagline: "A fleet of five agents + dashboard + weekly review.",
    audience: "Most teams.",
    highlighted: true,
  },
  {
    name: "Pantheon",
    setup: "$5,000 setup",
    monthly: "$1,000 / month",
    tagline: "Custom roster, dedicated CTO-agent, white-glove ops.",
    audience: "For SMBs scaling fast.",
  },
];

export function Pricing() {
  return (
    <section
      id="pricing"
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
          <span className="eyebrow">PRICING</span>
          <h2
            className="font-display text-sand mt-3"
            style={{ fontSize: "var(--h1)", lineHeight: 1.1 }}
          >
            One onboarding. Three rosters.
          </h2>
          <p className="text-bronze-up mt-4 max-w-xl">
            Every fleet starts with a $5,000 onboarding. The monthly is what
            scales with you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.7,
                delay: i * 0.08,
                ease: easeOut,
              }}
              className={`relative rounded-2xl bg-ink-warm p-8 flex flex-col gap-4 transition-transform duration-[var(--dur-soft)] ease-[var(--ease-out)] hover:-translate-y-2 ${
                tier.highlighted
                  ? "border-2 border-gold-orb shadow-[var(--elev-orb)]"
                  : "border border-hairline"
              }`}
            >
              {tier.highlighted && (
                <span className="absolute -top-3 left-8 bg-gold-orb text-ink-deep text-[11px] font-mono uppercase tracking-[0.08em] px-3 py-1 rounded-full">
                  Most teams
                </span>
              )}

              <div>
                <h3
                  className="font-display text-sand"
                  style={{ fontSize: "var(--h2)" }}
                >
                  {tier.name}
                </h3>
                <p className="text-bronze-up text-[15px] mt-2 leading-snug">
                  {tier.tagline} <em className="font-display">{tier.audience}</em>
                </p>
              </div>

              <div className="border-t border-hairline pt-4 flex flex-col gap-1">
                <span className="text-[14px] text-bronze-mid">{tier.setup}</span>
                <span
                  className="font-display text-sand"
                  style={{ fontSize: "var(--h2)" }}
                >
                  {tier.monthly}
                </span>
              </div>

              <a
                href={CONTACT_MAILTO}
                className={`${buttonVariants({
                  variant: tier.highlighted ? "primary" : "ghost",
                  size: "md",
                })} mt-auto w-full`}
              >
                Request demo
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
