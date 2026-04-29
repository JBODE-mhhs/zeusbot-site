import { buttonVariants } from "@/components/ui/button";
import { CONTACT_MAILTO } from "@/lib/constants";
import { SCRIM_RECIPES } from "@/components/scroll/scrimRecipes";

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
      data-section="pricing"
      id="pricing"
      className="relative h-screen w-full overflow-hidden"
    >
      <div
        data-scrim
        aria-hidden
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: SCRIM_RECIPES.pricing }}
      />
      <div className="relative z-[2] h-full max-w-[1280px] mx-auto px-6 lg:px-12 flex flex-col justify-center py-24">
        <div className="mb-12 max-w-2xl">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              data-anim={tier.highlighted ? "tier-featured" : "tier"}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
