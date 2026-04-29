"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { easeOut } from "@/lib/motion";

interface StatBlockProps {
  value: string;
  label: string;
  /** If true, animates a count-up of the numeric prefix. Default: true. */
  countUp?: boolean;
}

/**
 * StatBlock — number + uppercase mono label, with whileInView count-up.
 *
 * Parses the leading numeric run from `value` (e.g. "1,400+" → 1400) and
 * counts up to it over 1.2s. Reduced-motion users see the static final value.
 */
export function StatBlock({ value, label, countUp = true }: StatBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();
  const [displayed, setDisplayed] = useState(value);

  const target = parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
  const prefix = value.match(/^[^\d]*/)?.[0] ?? "";
  const suffix = value.match(/[^\d.]*$/)?.[0] ?? "";

  useEffect(() => {
    if (!countUp || reduced || !inView || target === 0) {
      setDisplayed(value);
      return;
    }
    const start = performance.now();
    const dur = 1200;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = target * eased;
      const formatted =
        target >= 100
          ? Math.round(cur).toLocaleString()
          : cur.toFixed(target % 1 === 0 ? 0 : 1);
      setDisplayed(`${prefix}${formatted}${suffix}`);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplayed(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, countUp, value, target, prefix, suffix]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: easeOut }}
      className="flex flex-col gap-2"
    >
      <span
        className="font-display text-sand tabular-nums"
        style={{ fontSize: "var(--display)", lineHeight: 1 }}
      >
        {displayed}
      </span>
      <span className="eyebrow">{label}</span>
    </motion.div>
  );
}
