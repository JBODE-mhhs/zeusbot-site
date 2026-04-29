"use client";

import { motion } from "framer-motion";
import { easeOut } from "@/lib/motion";
import { buttonVariants } from "@/components/ui/button";
import { CONTACT_MAILTO } from "@/lib/constants";

/**
 * CTA close — the cathedral close. Echo the hero, but resolved.
 * Full-bleed bg = frame_end.png (Zeus reaching, hands extended), heavily
 * darkened. Single centered text block, single CTA. (design-spec §3.6)
 */
export function CtaClose() {
  return (
    <section
      id="cta"
      className="relative py-40 lg:py-56 overflow-hidden border-t border-hairline"
    >
      {/* PLACEHOLDER — prometheus build-time: bg-cta-close.webp from frame_end */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: "url(/frame_end.png)",
          backgroundColor: "var(--ink-deep)",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, var(--ink-deep) 0%, rgba(25,12,12,0.55) 35%, rgba(25,12,12,0.85) 100%)",
        }}
        aria-hidden
      />

      <div className="max-w-[1280px] mx-auto px-6 lg:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: easeOut }}
        >
          <h2
            className="font-display text-sand mb-6"
            style={{
              fontSize: "var(--display)",
              lineHeight: 1.05,
              textShadow: "0 1px 24px rgba(0,0,0,0.6)",
            }}
          >
            Send the work.
          </h2>
          <p
            className="text-sand/85 max-w-xl mx-auto mb-10"
            style={{ textShadow: "0 1px 12px rgba(0,0,0,0.5)" }}
          >
            One conversation, a full fleet at your back, the work moves.
          </p>
          <a
            href={CONTACT_MAILTO}
            className={buttonVariants({ variant: "primary", size: "lg" })}
          >
            Request demo
          </a>
        </motion.div>
      </div>
    </section>
  );
}
