import { buttonVariants } from "@/components/ui/button";
import { CONTACT_MAILTO } from "@/lib/constants";
import { SCRIM_RECIPES } from "@/components/scroll/scrimRecipes";

export function CtaClose() {
  return (
    <section
      data-section="cta"
      id="cta"
      className="relative h-screen w-full overflow-hidden"
    >
      <div
        data-scrim
        aria-hidden
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: SCRIM_RECIPES.cta }}
      />
      <div className="relative z-[2] h-full max-w-[1280px] mx-auto px-6 lg:px-12 flex flex-col items-center justify-center text-center py-24">
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
          data-anim="cta-sub"
          className="text-sand/85 max-w-xl mx-auto mb-10"
          style={{ textShadow: "0 1px 12px rgba(0,0,0,0.5)" }}
        >
          One conversation, a full fleet at your back, the work moves.
        </p>
        <a
          data-anim="cta-primary"
          href={CONTACT_MAILTO}
          className={buttonVariants({ variant: "primary", size: "lg" })}
        >
          Request demo
        </a>
      </div>
    </section>
  );
}
