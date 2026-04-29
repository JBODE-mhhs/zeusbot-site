import Image from "next/image";
import { Mail, Code, Paintbrush, Receipt, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SCRIM_RECIPES } from "@/components/scroll/scrimRecipes";

type Capability = {
  icon: LucideIcon;
  headline: string;
  body: string;
};

const FEATURED: Capability = {
  icon: Code,
  headline: "They build for you.",
  body: "Prometheus, Hephaestus, and Argus ship code through the same review pipeline you'd run yourself.",
};

const SECONDARY: Capability[] = [
  {
    icon: Mail,
    headline: "They watch your inbox.",
    body: "Hermes triages email, surfaces what matters, archives the rest.",
  },
  {
    icon: Paintbrush,
    headline: "They write your story.",
    body: "Daedalus and Iris produce design, copy, and image assets in your brand.",
  },
  {
    icon: Receipt,
    headline: "They run your books.",
    body: "Apollo handles invoices, receipts, and reconciliation.",
  },
  {
    icon: ShieldCheck,
    headline: "They never sleep.",
    body: "Watchdog and Theseus monitor production around the clock.",
  },
];

export function Capabilities() {
  return (
    <section
      data-section="capabilities"
      id="capabilities"
      className="relative h-screen w-full overflow-hidden"
    >
      <div
        data-scrim
        aria-hidden
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: SCRIM_RECIPES.capabilities }}
      />
      <div className="relative z-[2] h-full max-w-[1280px] mx-auto px-6 lg:px-12 flex flex-col justify-center py-24">
        <div className="mb-12 max-w-2xl">
          <span className="eyebrow">CAPABILITIES</span>
          <h2
            className="font-display text-sand mt-3"
            style={{ fontSize: "var(--h1)", lineHeight: 1.1 }}
          >
            What the fleet does.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <article
            data-anim="card-featured"
            className="lg:col-span-7 bg-ink-warm rounded-2xl border border-hairline p-8 lg:p-10 flex flex-col gap-6 relative overflow-hidden"
          >
            <FEATURED.icon
              strokeWidth={1.5}
              className="h-7 w-7 text-gold-orb opacity-90"
              style={{ filter: "drop-shadow(0 0 16px rgba(255,206,111,0.25))" }}
              aria-hidden
            />
            <h3
              className="font-display text-sand"
              style={{ fontSize: "var(--h2)" }}
            >
              {FEATURED.headline}
            </h3>
            <p className="text-sand/80 max-w-md">{FEATURED.body}</p>

            <div className="mt-2 aspect-[16/10] rounded-xl border border-hairline-up bg-ink-deep relative overflow-hidden">
              <Image
                src="/capability-featured.webp"
                alt="Molten-gold figure forging an artifact at a Greek-revival forge"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
          </article>

          <div className="lg:col-span-5 grid gap-4">
            {SECONDARY.map((cap) => (
              <article
                key={cap.headline}
                data-anim="card-secondary"
                className="bg-ink-warm rounded-2xl border border-hairline p-6 flex gap-4 hover:border-hairline-up transition-colors"
              >
                <cap.icon
                  strokeWidth={1.5}
                  className="h-5 w-5 text-tan flex-shrink-0 mt-1"
                  aria-hidden
                />
                <div>
                  <h3 className="font-display text-sand text-[20px] leading-tight mb-1">
                    {cap.headline}
                  </h3>
                  <p className="text-[15px] text-sand/80 leading-snug">
                    {cap.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
