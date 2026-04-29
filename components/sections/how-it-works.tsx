import Image from "next/image";
import { SCRIM_RECIPES } from "@/components/scroll/scrimRecipes";

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

export function HowItWorks() {
  return (
    <section
      data-section="how"
      id="how-it-works"
      className="relative h-screen w-full overflow-hidden"
    >
      <div
        data-scrim
        aria-hidden
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: SCRIM_RECIPES.how }}
      />
      <div className="relative z-[2] h-full max-w-[1280px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-24">
        <div className="grid gap-8 max-w-xl">
          <div>
            <span className="eyebrow">HOW IT WORKS</span>
            <h2
              className="font-display text-sand mt-3"
              style={{ fontSize: "var(--h1)", lineHeight: 1.1 }}
            >
              Three steps. No magic.
            </h2>
          </div>

          {STEPS.map((step, i) => (
            <div
              key={step.n}
              data-anim={`step-${i + 1}`}
              className="grid gap-2"
            >
              <span
                className="eyebrow text-gold-orb"
                style={{ letterSpacing: "0.12em" }}
              >
                STEP {step.n}
              </span>
              <h3
                className="font-display text-sand"
                style={{ fontSize: "var(--h2)", lineHeight: 1.15 }}
              >
                {step.title}
              </h3>
              <p className="text-bronze-up text-[17px] leading-relaxed">
                {step.body}
              </p>
            </div>
          ))}
        </div>

        <div
          className="hidden lg:block aspect-[16/10] rounded-2xl border border-hairline bg-ink-warm relative overflow-hidden"
          aria-hidden
        >
          <Image
            src={STEPS[1].image.src}
            alt=""
            width={1280}
            height={800}
            sizes="50vw"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
